import React, { Fragment } from 'react';
import { Checkbox, RadioGroup, Dropdown, Icon } from 'ming-ui';
import { Tooltip } from 'antd';
import cx from 'classnames';
import WidgetRowHeight from '../WidgetRowHeight';
import { SettingItem } from 'src/pages/widgetConfig/styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../util/setting';

const DISPLAY_LIST = [
  {
    text: _l('经典模式'),
    value: '0',
  },
  {
    text: _l('电子表格模式'),
    value: '1',
  },
];

export default function RelateStyle(props) {
  const { data, onChange } = props;
  const { alternatecolor = '1', sheettype = '0', allowedit = '1', layercontrolid, showtype } = getAdvanceSetting(data);
  const tableControls = _.get(data, 'relationControls') || [];
  const tableData = tableControls
    .filter(c => c.type === 29 && c.dataSource === data.dataSource && c.enumDefault === 1)
    .map(i => ({ value: i.controlId, text: i.controlName }));

  const isDelete = layercontrolid && !_.find(tableControls, t => t.controlId === layercontrolid);
  const isUnSupport =
    layercontrolid &&
    !_.find(tableData, t => t.value === layercontrolid) &&
    _.find(tableControls, t => t.controlId === layercontrolid);

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">
          {_l('交互方式')}{' '}
          <Tooltip
            placement="bottom"
            title={
              <span>
                {_l('经典模式：点整行打开记录')}
                <br />
                {_l('电子表格模式：点单元格选中字段，按空格键打开记录')}
              </span>
            }
          >
            <i className="icon-help Gray_9e Font16"></i>
          </Tooltip>
        </div>
        <RadioGroup
          size="middle"
          checkedValue={sheettype}
          data={DISPLAY_LIST}
          onChange={value => onChange(handleAdvancedSettingChange(data, { sheettype: value }))}
        />
      </SettingItem>
      <WidgetRowHeight {...props} />

      {data.type === 29 && showtype === '5' && (
        <SettingItem>
          <div className="settingItemTitle">
            {_l('树形表格')}
            {isUnSupport && (
              <Tooltip popupPlacement="bottom" title={_l('该关联记录字段不是一对多关系')}>
                <Icon className="Font20 mLeft8 Red" icon="error1" />
              </Tooltip>
            )}
          </div>
          <Dropdown
            border
            className={cx({ error: isUnSupport })}
            cancelAble
            placeholder={isDelete ? <span className="Red">{_l('已删除')}</span> : _l('选择关联表中的关联本表字段')}
            value={isDelete ? undefined : layercontrolid || undefined}
            data={tableData}
            renderTitle={() => {
              return _.get(
                _.find(tableControls, t => t.controlId === layercontrolid),
                'controlName',
              );
            }}
            noData={_l('未添加关联本表字段')}
            onChange={value =>
              onChange(
                handleAdvancedSettingChange(data, {
                  layercontrolid: value || '',
                  ...(value ? { showcount: '1' } : {}),
                }),
              )
            }
          />
          <div className="mTop10 Gray_9e">
            {_l('选择一个一对多关系的本表关联字段，数据将按此字段的父级（单条）、子级（多条）关系构成树形表格')}
          </div>
        </SettingItem>
      )}

      <SettingItem>
        <div className="settingItemTitle">{_l('其他')}</div>
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={allowedit === '1'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { allowedit: String(+!checked) }))}
          >
            <span style={{ marginRight: '4px' }}>{_l('允许行内编辑')}</span>
            <Tooltip placement="bottom" title={_l('勾选后可以在单元格直接编辑 Excel')}>
              <i className="icon-help Gray_9e Font16"></i>
            </Tooltip>
          </Checkbox>
        </div>
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={alternatecolor === '1'}
            text={_l('显示交替行颜色')}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { alternatecolor: String(+!checked) }))}
          />
        </div>
      </SettingItem>
    </Fragment>
  );
}
