import React, { useState, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import ExistSourceModal from 'src/pages/integration/dataIntegration/components/ExistSourceModal';
import autoSize from 'ming-ui/decorators/autoSize';
import _ from 'lodash';
const Wrap = styled.div`
  .addSource {
    background: #ffffff;
    border: 1px dashed #dddddd;
    border-radius: 4px;
    color: #2196f3;
    &:hover {
      border: 1px dashed #2196f3;
    }
  }
  .sourceCard {
    padding: 12px 20px;
    background: #ffffff;
    border: 1px solid #e2e2e2;
    border-radius: 4px;
    .imgCon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      svg {
        width: 18px;
        height: 18px;
      }
    }
  }
`;
const PopupWrap = styled.div(
  ({ width }) => `
  padding: 6px 0;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.24);
  opacity: 1;
  background: #ffffff;
  border-radius: 4px;
  width:${width}px;
  .item {
    padding: 12px 20px;
    background: #ffffff;
    .title {
      font-size: 15px;
      font-weight: 500;
    }
    .des {
      font-size: 13px;
      font-weight: 400;
      color: #9E9E9E;
    }
    &.isCur,
    &:hover {
      background: #f5f5f5;
    }
  }
`,
);
//新增源|目的地

function AddSourceOrDest(props) {
  const { onUpdate, node = {} } = props;
  const { nodeType = '', name = '', description = '' } = node;
  const {
    dbName = '',
    dsType,
    tableName,
    schema,
    iconBgColor,
    className,
  } = _.get(node, ['nodeConfig', 'config']) || {};
  const [{ visible, show, sourceFormData }, setState] = useSetState({
    visible: false,
    sourceFormData: {},
  });

  const renderPopup = () => {
    return (
      <PopupWrap width={props.width}>
        <div
          className="item Hand"
          onClick={() => {
            onUpdate({
              ...node,
              name: '表格',
              nodeConfig: {
                ...(node.nodeConfig || {}),
                config: {
                  ...(_.get(node, 'nodeConfig.config') || {}),
                  dsType: 'MING_DAO_YUN',
                  dbName: '',
                  tableName: '',
                  schema: '',
                  className: 'mingdaoyun',
                  iconBgColor: '#E8F4FE',
                },
              },
            });

            setState({
              visible: false,
            });
          }}
        >
          <div className="title">{_l('工作表数据')}</div>
          <div className="des">{_l('从当前用户作为管理员的应用工作表实时同步')}</div>
        </div>
        <div
          className="item Hand"
          onClick={() => {
            setState({
              show: true,
              visible: false,
            });
          }}
        >
          <div className="title">{_l('外部数据源')}</div>
          <div className="des">{_l('从本地数据库，云数据库或消息队列服务器读取数据并实时同步')}</div>
        </div>
      </PopupWrap>
    );
  };
  return (
    <Wrap>
      <Trigger
        popupVisible={visible}
        action={['click']}
        popupClassName="dropTriggerWrap"
        popup={renderPopup()}
        getPopupContainer={() => document.body}
        onPopupVisibleChange={visible => {
          // setState({ visible });
        }}
        popupAlign={{
          points: ['tl', 'bl'],
          offset: [0, 0],
          overflow: { adjustX: true, adjustY: true },
        }}
      >
        {!dsType ? (
          <div
            className="addSource Bold Hand TxtCenter"
            style={{ height: `${props.height || 58}px`, lineHeight: `${props.height || 58}px` }}
          >
            <i className="icon icon-add_circle_outline  mRight5" />
            {_l('选择数据源')}
          </div>
        ) : (
          <div className="sourceCard flexRow mTop12">
            <div className="imgCon flexRow alignItemsCenter justifyContentCenter" style={{ background: iconBgColor }}>
              <svg className="icon svg-icon" aria-hidden="true">
                <use xlinkHref={`#icon${className}`}></use>
              </svg>
            </div>
            <div className="flex mLeft8">
              <div className="name Bold">{name}</div>
              {/* 明道云工作表显示表名称  dsType === 'MING_DAO_YUN' ? tableName : ？？？？？？ */}
              <div className="des Gray_9e">{tableName}</div>
            </div>
            <i className="icon icon-expand_more Font20 Hand" />
          </div>
        )}
      </Trigger>
      {show && (
        <ExistSourceModal
          {...props}
          setExistSourceModalVisible={show => {
            setState({
              show,
            });
          }}
          setInitData={data => {
            const { className, id, iconBgColor, type, name } = data;
            onUpdate({
              ...node,
              name,
              nodeConfig: {
                ...(node.nodeConfig || {}),
                config: {
                  ...(_.get(node, 'nodeConfig.config') || {}),
                  datasourceId: id,
                  dsType: type,
                  dbName: '',
                  tableName: '',
                  schema: '',
                  className,
                  iconBgColor,
                },
              },
            });
          }}
        />
      )}
    </Wrap>
  );
}

export default autoSize(AddSourceOrDest);