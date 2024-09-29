import React from 'react';
import sheetAjax from 'src/api/worksheet';
import { checkValueAvailable, replaceStr } from './filterFn';
import { getDynamicValue, calcDefaultValueFunction } from './DataFormat.js';
import { getParamsByConfigs } from '../widgets/Search/util.js';
import { upgradeVersionDialog } from 'src/util';
import { Dialog } from 'ming-ui';
import { handleUpdateApi } from '../widgets/Search/util.js';
import { formatControlToServer, formatFiltersValue } from './utils.js';
import { FORM_ERROR_TYPE } from './config.js';
import {
  FILTER_VALUE_ENUM,
  ACTION_VALUE_ENUM,
  SPLICE_TYPE_ENUM,
  VOICE_FILE_LIST,
  ADD_EVENT_ENUM,
} from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';
import fileAjax from 'src/api/file';
import _ from 'lodash';
import { isSheetDisplay } from '../../../pages/widgetConfig/util/index.js';

// 显隐、只读编辑等处理
const dealDataPermission = props => {
  const { actionItems = [], actions = [], actionType, formData = [] } = props;

  function setEventPermission(item) {
    // eventPermissions给默认值111，计算会覆盖字段原始只读(x用来区分是否由事件导致变更过)
    let eventPermissions = item.eventPermissions || 'xxx';
    switch (actionType) {
      case ACTION_VALUE_ENUM.READONLY:
        eventPermissions = replaceStr(eventPermissions, 1, '0');
        break;
      case ACTION_VALUE_ENUM.EDIT:
        eventPermissions = replaceStr(eventPermissions, 1, '1');
        break;
      case ACTION_VALUE_ENUM.SHOW:
        eventPermissions = replaceStr(eventPermissions, 0, '1');
        break;
      case ACTION_VALUE_ENUM.HIDE:
        eventPermissions = replaceStr(eventPermissions, 0, '0');
        break;
    }
    item.eventPermissions = eventPermissions.replace(/x/g, (a, b) => {
      return (item.fieldPermission || '111')[b];
    });
  }

  // 只读所有字段
  if (actionType === ACTION_VALUE_ENUM.READONLY && _.some(actions, a => a.isAll)) {
    formData.forEach(item => setEventPermission(item));
  } else {
    formData.forEach(item => {
      actionItems.map(i => {
        const { controlId, childControlIds = [] } = i || {};
        if (controlId === _.get(item, 'controlId')) {
          if (_.isEmpty(childControlIds)) {
            setEventPermission(item);
          } else {
            childControlIds.map(childId => {
              const childControl = _.find(_.get(item, 'relationControls') || [], re => re.controlId === childId);
              if (childControl) {
                setEventPermission(childControl);
              }
            });
          }
        }
      });
    });
  }

  return formData;
};

// 获取默认值
const getDynamicData = ({ formData, embedData, masterData }, control) => {
  const defaultType = _.get(control, 'advancedSetting.defaulttype');
  // 函数
  if (defaultType === '1') {
    const defaultFunc = _.get(control, 'advancedSetting.defaultfunc');
    if (_.isEmpty(defaultFunc)) {
      return isSheetDisplay(control) ? '[]' : '';
    }
    return calcDefaultValueFunction({ fnControl: control, formData, forceSyncRun: true });
  } else {
    const defSource = _.get(control, 'advancedSetting.defsource');
    const parsed = safeParse(defSource, 'array');
    // 没值或配置清空相当于清空
    if (_.isEmpty(parsed) || _.get(parsed, '0.cid') === 'empty') {
      return isSheetDisplay(control) ? '[]' : '';
    }
    return getDynamicValue(formData, control, masterData, embedData);
  }
};

// 获取查询工作表结果
const getSearchWorksheetResult = async props => {
  const { advancedSetting = {}, searchConfig = [], formData, recordId } = props;
  const { id } = safeParse(advancedSetting.dynamicsrc || '{}');
  const currentSearchConfig = _.find(searchConfig, s => s.id === id) || {};
  const { items = [], templates = [], sourceId, moreSort, resultType } = currentSearchConfig;
  const controls = _.get(templates[0] || {}, 'controls') || [];
  if (templates.length > 0 && controls.length > 0) {
    let params = {
      filterControls: formatFiltersValue(items, formData, recordId),
      pageIndex: 1,
      searchType: 1,
      status: 1,
      getType: 7,
      worksheetId: sourceId,
      pageSize: 10,
      id,
      getAllControls: true,
      sortControls: moreSort,
    };
    if (window.isPublicWorksheet) {
      params.formId = window.publicWorksheetShareId;
    }

    const resultData = await sheetAjax.getFilterRowsByQueryDefault(params);

    if (_.get(resultData, 'resultCode') === 1) {
      const dataCount = resultData.count || 0;
      let searchConfigResult = false;
      // 一条
      if (resultType === 1) {
        searchConfigResult = dataCount === 1;
      } else if (resultType === 2) {
        searchConfigResult = dataCount > 1;
      } else if (resultType === 3) {
        searchConfigResult = !dataCount;
      } else {
        searchConfigResult = !!dataCount;
      }
      return searchConfigResult;
    } else {
      return false;
    }
  }
  return false;
};

// 创建记录
const createRecord = async props => {
  const { actionItems = [], advancedSetting = {}, projectId } = props;

  const receiveControls = [];

  const sheetData = await sheetAjax.getWorksheetInfo({ worksheetId: advancedSetting.sheetId, getTemplate: true });

  const controls = _.get(sheetData, 'template.controls') || [];

  actionItems.map(item => {
    const control = _.find(controls, f => f.controlId === item.controlId);
    if (control) {
      const formatControl = formatControlToServer(
        { ...control, value: getDynamicData(props, { ...control, advancedSetting: { defsource: item.value } }) },
        { isNewRecord: true },
      );
      receiveControls.push(formatControl);
    }
  });

  let para = {
    projectId,
    appId: advancedSetting.appId,
    worksheetId: advancedSetting.sheetId,
    rowStatus: 1,
    pushUniqueId: md.global.Config.pushUniqueId,
    receiveControls: receiveControls,
  };
  sheetAjax.addWorksheetRow(para).then(res => {
    if (res.resultCode === 1) {
      alert(_l('创建成功'));
    }
  });
};

// api查询
const handleSearchApi = async props => {
  const { advancedSetting = {}, dataSource, formData, projectId, worksheetId, appId, controlId, recordId } = props;
  const requestMap = safeParse(advancedSetting.requestmap || '[]');
  const apiFormData = formData.concat([{ controlId: 'rowid', value: recordId }]);
  const paramsData = getParamsByConfigs(requestMap, apiFormData);

  let params = {
    data: !requestMap.length || _.isEmpty(paramsData) ? '' : paramsData,
    projectId,
    controlId,
    workSheetId: worksheetId,
    apkId: appId,
    apiTemplateId: dataSource,
    apiEventId: advancedSetting.apiEventId,
    authId: advancedSetting.authaccount,
  };

  if (window.isPublicWorksheet) {
    params.formId = window.publicWorksheetShareId;
  }

  const apiData = await sheetAjax.excuteApiQuery(params);

  if (apiData.code === 20008) {
    upgradeVersionDialog({
      projectId,
      okText: _l('立即充值'),
      hint: _l('余额不足，请联系管理员充值'),
      explainText: <div></div>,
      onOk: () => {
        location.href = `/admin/valueaddservice/${projectId}`;
      },
    });
    return;
  }

  if (apiData.message) {
    alert(apiData.message, 3);
    return;
  }
  return apiData.apiQueryData || {};
};

// 判断筛选条件
const checkFiltersAvailable = async props => {
  const { filters = [], recordId, formData } = props;
  let result = [];

  const currentSpliceType = _.get(filters, [0, 'spliceType']);

  for (const f of filters) {
    const { valueType, filterItems = [], advancedSetting = {}, dataSource } = f;

    switch (valueType) {
      // 字段值
      case FILTER_VALUE_ENUM.CONTROL_VALUE:
        const { isAvailable } = checkValueAvailable({ filters: filterItems }, formData, recordId);
        result.push(isAvailable);
        break;
      // 查询工作表
      case FILTER_VALUE_ENUM.SEARCH_WORKSHEET:
        const res = await getSearchWorksheetResult({ ...props, advancedSetting });
        result.push(res);
        break;
      // api查询
      // case FILTER_VALUE_ENUM.API:
      //   // apiRes, 为判断提供数据源;
      //   const apiRes = await handleSearchApi({ ...props, advancedSetting, dataSource });
      //   const apiResult = checkValueAvailable({ filters: filterItems }, formData, recordId);
      //   result.push(apiResult.isAvailable);
      //   break;
      // 自定义函数
      case FILTER_VALUE_ENUM.CUSTOM_FUN:
        const funResult = calcDefaultValueFunction({ fnControl: { ...props, advancedSetting }, formData });
        result.push(funResult);
        break;
    }
  }

  if (currentSpliceType === SPLICE_TYPE_ENUM.AND) {
    return _.every(result, r => !!r);
  }

  return _.some(result, r => !!r);
};

// 成立则执行一下动作
const triggerCustomActions = async props => {
  const {
    actions = [],
    formData,
    recordId,
    worksheetId,
    setRenderData = () => {},
    handleChange = () => {},
    setErrorItems = () => {},
    triggerType,
  } = props;

  for (const a of actions) {
    const { actionType, actionItems = [], message = '', advancedSetting = {}, dataSource } = a;

    switch (actionType) {
      // 显示、隐藏
      case ACTION_VALUE_ENUM.SHOW:
      case ACTION_VALUE_ENUM.HIDE:
      // 可编辑、只读
      case ACTION_VALUE_ENUM.EDIT:
      case ACTION_VALUE_ENUM.READONLY:
        const newRenderData = dealDataPermission({ ...props, actionItems, actionType });
        setRenderData(newRenderData);
        break;
      // 错误提示
      case ACTION_VALUE_ENUM.ERROR:
        const errorInfos = [];
        actionItems.map(item => {
          const errorControl = _.find(formData, f => f.controlId === item.controlId);
          if (errorControl) {
            const errorMessage = getDynamicData(props, { ...errorControl, advancedSetting: { defsource: item.value } });
            errorInfos.push({
              controlId: item.controlId,
              errorMessage,
              errorType: FORM_ERROR_TYPE.OTHER_ERROR,
              showError: true,
            });
          }
        });
        setErrorItems(errorInfos);
        break;
      // 设置字段值
      case ACTION_VALUE_ENUM.SET_VALUE:
        actionItems.forEach(item => {
          const control = _.find(formData, f => f.controlId === item.controlId);
          if (control) {
            let value = getDynamicData(props, {
              ...control,
              advancedSetting: {
                // 当前人员需要
                ..._.omit(control.advancedSetting || {}, ['defaultfunc', 'defsource']),
                [item.type === '1' ? 'defaultfunc' : 'defsource']: item.value,
                defaulttype: item.type,
              },
            });
            // 已有记录关联列表不变更
            const canNotSet =
              control.type === 29 && _.includes(['2', '6'], _.get(control, 'advancedSetting.showtype')) && recordId;
            if (value !== control.value && !props.disabled && !canNotSet) {
              if (control.type === 29) {
                try {
                  const records = safeParse(value);
                  value = JSON.stringify(
                    records.map(record => ({
                      ...record,
                      count: records.length,
                    })),
                  );
                } catch (err) {
                  console.log(err);
                }
              }
              handleChange(value, item.controlId, control, false);
            }
          }
        });
        break;
      // 刷新字段值
      case ACTION_VALUE_ENUM.REFRESH_VALUE:
        if (!recordId) return;
        actionItems.forEach(async item => {
          const control = _.find(formData, f => f.controlId === item.controlId);
          if (control) {
            const refreshResult = await sheetAjax.refreshSummary({
              worksheetId,
              rowId: recordId,
              controlId: item.controlId,
            });
            handleChange(refreshResult, item.controlId, control, false);
          }
        });
        break;
      // 调用api
      case ACTION_VALUE_ENUM.API:
        const apiRes = await handleSearchApi({ ...props, advancedSetting, dataSource });
        handleUpdateApi(
          {
            ...props,
            advancedSetting,
            onChange: (value, cid) => {
              handleChange(
                value,
                cid,
                _.find(formData, f => f.controlId === cid),
                false,
              );
            },
          },
          apiRes,
          true,
        );
        break;
      // 提示消息
      case ACTION_VALUE_ENUM.MESSAGE:
        const messageInfo = getDynamicData(props, {
          type: 2,
          advancedSetting: { defsource: message },
        });
        const splitMessage = String(messageInfo).substr(0, 50);
        if (splitMessage) {
          alert(splitMessage, Number(advancedSetting.alerttype));
        }
        break;
      // 播放声音
      case ACTION_VALUE_ENUM.VOICE:
        const { fileKey, voicefiles } = advancedSetting;
        const voiceFiles = VOICE_FILE_LIST.concat(safeParse(voicefiles, 'array'));
        const curFile = _.find(voiceFiles, v => v.fileKey === fileKey);
        if (fileKey && curFile) {
          let audioSrc = _.get(curFile, 'filePath');
          // 上传的mp3置换url
          if (!Number(fileKey)) {
            audioSrc = await fileAjax.getChatFileUrl({ serverName: curFile.filePath, key: fileKey });
          }
          if (!window.customEventAudioPlayer) {
            const audio = document.createElement('audio');
            window.customEventAudioPlayer = audio;
          }
          window.customEventAudioPlayer.src = audioSrc;
          window.customEventAudioPlayer.play();
        }
        break;
      // 打开链接
      case ACTION_VALUE_ENUM.LINK:
        const linkInfo = getDynamicData(props, {
          type: 2,
          advancedSetting: { defsource: message },
        });
        if (advancedSetting.opentype === '2') {
          if (/^https?:\/\/.+$/.test(linkInfo)) {
            Dialog.confirm({
              width: 640,
              title: null,
              noFooter: true,
              closable: true,
              children: (
                <iframe
                  width={640}
                  height={600}
                  frameborder="0"
                  allowtransparency="true"
                  webkitallowfullscreen="true"
                  mozallowfullscreen="true"
                  allowfullscreen="true"
                  src={linkInfo}
                />
              ),
            });
          }
        } else {
          window.open(linkInfo);
        }
        break;
      // 创建记录
      case ACTION_VALUE_ENUM.CREATE:
        createRecord({ ...props, actionItems, advancedSetting });
        break;
    }
  }
};

/**
 * 执行自定义事件
 * triggerType: 当前触发执行的事件类型
 */
export const dealCustomEvent = props => {
  const { triggerType, renderData = [] } = props;
  const customEvent = safeParse(_.get(props, 'advancedSetting.custom_event'), 'array');

  // 以下情况不生效
  if (
    _.get(window, 'shareState.isPublicRecord') ||
    _.get(window, 'shareState.isPublicView') ||
    _.get(window, 'shareState.isPublicPage') ||
    _.get(window, 'shareState.isPublicQuery') ||
    _.get(window, 'shareState.isPublicPrint')
  )
    return;

  // 避免提交、保存等操作组件卸载事件触发隐藏事件
  if (
    triggerType === ADD_EVENT_ENUM.HIDE &&
    _.get(
      _.find(renderData, r => r.controlId === props.controlId),
      'fieldPermission.[0]',
    ) === '1'
  ) {
    return;
  }

  customEvent.forEach(async item => {
    const { eventType, eventActions = [] } = item;
    if (eventType === triggerType) {
      for (const e of eventActions) {
        const { filters = [], actions = [] } = e;

        const filterResult = await checkFiltersAvailable({ ...props, filters });
        if (_.isEmpty(filters) || filterResult) {
          triggerCustomActions({ ...props, actions });
          return;
        }
      }
    }
  });
};
