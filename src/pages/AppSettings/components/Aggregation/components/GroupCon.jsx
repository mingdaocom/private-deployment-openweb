import React, { Fragment, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Icon, MenuItem, SortableList } from 'ming-ui';
import cx from 'classnames';
import { useSetState } from 'react-use';
import { getIconByType } from 'src/pages/widgetConfig/util';
import ChangeName from 'src/pages/integration/components/ChangeName.jsx';
import { Tooltip } from 'antd';
import {
  getRuleAlias,
  isDateTimeGroup,
  getDefaultOperationForGroup,
  isTimeGroup,
  getAllSourceList,
  isDelStatus,
  setResultFieldSettingByAggFuncType,
  getSourceIndex,
} from '../util';
import { WrapS } from './style';
import Trigger from 'rc-trigger';
import { getTranslateInfo } from 'src/util';
import { DEFAULT_COLORS } from '../config';
import _ from 'lodash';

const WrapItem = styled.div`
  height: 36px;
  background: #ffffff;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.16);
  border-radius: 4px;
  z-index: 1000;
  .dragIcon {
    opacity: 0;
    position: absolute;
    left: -16px;
    top: 12px;
    font-size: 14px;
  }
  &:hover {
    .dragIcon {
      opacity: 1;
    }
  }
`;
export default function GroupCon(props) {
  const { list, onChange, sourceTables, updateErr, flowData, sourceInfos } = props;

  const Item = props => {
    const { item, onUpdate, items, DragHandle } = props;
    const [{ showChangeName, popupVisible }, setState] = useSetState({
      showChangeName: false,
      popupVisible: false,
    });
    let isDelete = _.get(item, 'resultField.isDelete');
    const fields = _.get(item, 'fields') || [];
    if (fields.length !== sourceTables.length) {
      isDelete = true;
    }
    fields.map(o => {
      if (isDelStatus(o, sourceInfos, '')) {
        isDelete = true;
      }
    });
    isDelete && updateErr();
    const getInfo = sourceTables.find(o => _.get(item, 'resultField.oid').indexOf(o.workSheetId) >= 0) || {};

    const index = getSourceIndex(flowData, item);
    const color = DEFAULT_COLORS[index];
    return (
      <WrapItem className="flexRow cardItem alignItemsCenter Relative mTop12 hoverBoxShadow">
        {sourceTables.length <= 1 && (getAllSourceList(flowData) || []).length > 1 && (
          <div className="colorByWorksheet" style={{ backgroundColor: color }}></div>
        )}
        <DragHandle className="alignItemsCenter flexRow">
          <Icon className="Font14 Hand Gray_9e Hover_21 dragIcon" icon="drag" />
        </DragHandle>
        <div className="flex flexRow pLeft16 pRight12 alignItemsCenter">
          <React.Fragment>
            <Icon
              icon={getIconByType(_.get(item, 'resultField.mdType'))}
              className={cx('Gray_9e Font16 ThemeHoverColor3')}
            />
            <div
              className={cx('flex mLeft8 mRight8 overflow_ellipsis WordBreak', {
                Red: isDelete,
              })}
            >
              {_.get(item, 'resultField.alias')}
            </div>
          </React.Fragment>
          {sourceTables.length <= 1 && (
            <Tooltip
              placement="bottom"
              title={
                <span className="">
                  {_.get(item, 'resultField.parentFieldInfo.controlSetting.controlName') && (
                    <span className="Gray_bd pRight5">{_l('关联')}</span>
                  )}
                  {`${
                    _.get(item, 'resultField.parentFieldInfo.controlSetting.controlName')
                      ? _.get(item, 'resultField.parentFieldInfo.controlSetting.controlName') + '>'
                      : (getTranslateInfo(getInfo.appId, null, getInfo.workSheetId).name ||
                          getInfo.tableName ||
                          _l('未命名')) + '-'
                  }${
                    !_.get(item, 'resultField.controlSetting')
                      ? _.get(item, 'resultField.alias')
                      : _.get(item, 'resultField.controlSetting.controlName') || _l('未命名')
                  }`}
                </span>
              }
            >
              <Icon icon="info_outline" className="Hand Gray_9e ThemeHoverColor3 Font16" />
            </Tooltip>
          )}
          {/* {isDateTimeGroup(item) || isTimeGroup(item)  */}
          {isDateTimeGroup(item) ? (
            <Trigger
              action={['click']}
              popupVisible={popupVisible}
              onPopupVisibleChange={popupVisible => {
                setState({ popupVisible });
              }}
              getPopupContainer={() => document.body}
              popupAlign={{ points: ['tl', 'bl'], offset: [0, 4], overflow: { adjustX: true, adjustY: true } }}
              popup={
                <WrapS className={cx('Relative')}>
                  <MenuItem
                    className="settingSheet"
                    onClick={() => {
                      setState({
                        showChangeName: true,
                        popupVisible: false,
                      });
                    }}
                  >
                    <span className="text Font14">{_l('重命名')}</span>
                  </MenuItem>
                  <React.Fragment>
                    <Trigger
                      action={['hover']}
                      popupAlign={{
                        points: ['tl', 'tr'],
                        offset: [0, -5],
                        overflow: { adjustX: true, adjustY: true },
                      }}
                      popup={
                        <WrapS className="Relative">
                          {getDefaultOperationForGroup(item).map(o => {
                            return (
                              <MenuItem
                                className={cx('settingSheet flexRow Font14', {
                                  ThemeColor3: o.value === _.get(item, 'resultField.aggFuncType'),
                                })}
                                onClick={() => {
                                  if (o.value === item.aggFuncType) {
                                    return;
                                  }
                                  const hs = !!list.find(it => it.oid === item.oid && it.aggFuncType === o.value);
                                  if (hs) {
                                    alert(_l('不能重复添加相同归组方式的相同字段'), 3);
                                    return;
                                  }
                                  onUpdate(
                                    items.map(a => {
                                      if (_.get(a, 'resultField.id') === _.get(item, 'resultField.id')) {
                                        return {
                                          ...a,
                                          resultField: setResultFieldSettingByAggFuncType({
                                            ...a.resultField,
                                            aggFuncType: o.value,
                                            alias: getRuleAlias(
                                              `${_.get(a, 'resultField.name')}-${o.text}`,
                                              props.flowData,
                                            ),
                                          }),
                                        };
                                      }
                                      return a;
                                    }),
                                  );
                                  setState({
                                    popupVisible: false,
                                  });
                                }}
                              >
                                <span className="flexRow w100">
                                  <span className="flex"> {o.text}</span>
                                </span>
                              </MenuItem>
                            );
                          })}
                        </WrapS>
                      }
                    >
                      <MenuItem
                        className="flexRow alignItemsCenter"
                        onClick={() => {
                          setState({
                            popupVisible: true,
                          });
                        }}
                      >
                        <span className="text flex Font14">{_l('归组')}</span>
                        <Icon className="Font15 Gray_9e Font13" icon="arrow-right-tip" />
                      </MenuItem>
                    </Trigger>
                  </React.Fragment>
                </WrapS>
              }
            >
              <Icon
                icon="arrow-down-border"
                className="Hand Gray_9e ThemeHoverColor3 Font16 mLeft8"
                onClick={() =>
                  setState({
                    popupVisible: true,
                  })
                }
              />
            </Trigger>
          ) : (
            <Tooltip title={_l('重命名')}>
              <Icon
                icon="rename_input"
                className="Font16 Hand Gray_75 ThemeHoverColor3 mLeft8"
                onClick={() => {
                  setState({
                    showChangeName: true,
                  });
                }}
              />
            </Tooltip>
          )}
          <Tooltip title={_l('删除')}>
            <Icon
              icon="clear"
              className="clearIcon Hand Gray_9e del ThemeHoverColor3 mLeft8 Font16"
              onClick={() => {
                onUpdate(
                  items.filter(
                    o =>
                      !(
                        _.get(o, 'resultField.parentFieldInfo.oid') ===
                          _.get(item, 'resultField.parentFieldInfo.oid') &&
                        _.get(o, 'resultField.oid') === _.get(item, 'resultField.oid')
                      ),
                  ),
                );
              }}
            />
          </Tooltip>
        </div>
        {showChangeName && (
          <ChangeName
            name={_.get(item, 'resultField.alias')}
            onCancel={() => {
              setState({
                showChangeName: false,
              });
            }}
            onChange={name => {
              if (_.get(item, 'resultField.alias') === name) {
                return;
              }
              if (!getRuleAlias(name, props.flowData, true)) {
                return alert(_l('已存在该字段名称，名称不可重复'), 3);
              }
              onUpdate(
                items.map(o => {
                  if (_.get(o, 'resultField.id') === _.get(item, 'resultField.id')) {
                    return {
                      ...o,
                      resultField: {
                        ...o.resultField,
                        alias: name,
                      },
                    };
                  }
                  return o;
                }),
                false,
              );
              setState({
                showChangeName: false,
              });
            }}
          />
        )}
      </WrapItem>
    );
  };

  return (
    <SortableList
      useDragHandle
      canDrag
      items={list.map((o, i) => {
        return { ...o, num: i };
      })}
      itemKey="num"
      onSortEnd={(newItems = [], newIndex) => {
        onChange(
          newItems.map(o => _.omit(o, 'num')),
          false,
        );
      }}
      itemClassName="boderRadAll_4"
      renderItem={options => (
        <Item
          {...props}
          {...options}
          onUpdate={(list, isChange) => {
            onChange(
              list.map(o => _.omit(o, 'num')),
              isChange,
            );
          }}
          sourceTables={props.sourceTables}
          flowData={props.flowData}
        />
      )}
    />
  );
}
