import React, { Fragment, useRef, useState, useEffect } from 'react';
import { Popup, Dialog } from 'antd-mobile';
import functionWrap from 'ming-ui/components/FunctionWrap';
import styled from 'styled-components';

const ModalWrap = styled(Popup)`
  overflow: hidden;
  .adm-popup-body {
    padding: 16px;
    color: #333;
    font-size: 13px;
    display: flex;
    flex-direction: column;
  }
  .success {
    color: #4caf50;
    font-size: 20px;
  }
  .error {
    color: #f44336;
  }
  .warning {
    color: #fb0;
  }
  .info {
    color: #1c97f3;
  }
  .overflowAuto {
    overflow: auto;
  }
  .btnsWrap {
    .btnItem {
      background-color: #2196f3;
      height: 36px;
      border-radius: 18px;
      margin-right: 15px;
      text-align: center;
      color: #fff;
      line-height: 36px;
      padding: 0 12px;
      &:last-child {
        margin-right: 0px;
      }
    }
  }
`;

const BatchModalWrap = styled.div`
  .success {
    color: #4caf50;
    font-size: 20px;
  }
  .error {
    color: #f44336;
  }
  .warning {
    color: #fb0;
  }
  .info {
    color: #1c97f3;
  }
`;

function getIconName(type = 'success') {
  return (
    {
      success: 'succeed-circle',
      error: 'closeelement-bg-circle',
      warning: 'task-folder-message',
      info: 'info',
    }[type] || ''
  );
}

let modal = null;

function MessageComp(props) {
  const {
    loading,
    type,
    visible,
    title,
    btnList = [],
    description,
    duration,
    batchInfo = {},
    position = 'bottom',
    hideModalMessage = () => {},
  } = props;

  useEffect(() => {
    if (position === 'center') {
      return showModal();
    }
    aotoClose();
  }, []);

  const aotoClose = () => {
    if (!duration) return;
    setTimeout(() => {
      hideModalMessage();
    }, duration * 1000);
  };

  const getIcon = () => {
    if (loading) {
      return (
        <div className="notificationIconWrap">
          <i className="icon-loading_button"></i>
        </div>
      );
    }
    return <i className={`Font24 ${type} icon-${getIconName(type)}`}></i>;
  };

  const getBatchNoticeDescription = ({ finished, total, failed, executeType }) => {
    if (finished === total) {
      return `${_l('执行完成! ')}\n${failed > 0 ? _l('%0条失败', failed) : ''}`;
    } else {
      return _l('正在执行... %0/%1', finished, total);
    }
  };

  const showModal = () => {
    if (modal) {
      modal.close();
    }
    modal = Dialog.alert({
      content: (
        <BatchModalWrap>
          <div className="flexRow">
            <div className="flex mBottom16 ellipsis">
              {getIcon()}
              <span className="bold Font18 TxtBottom mLeft10">{title}</span>
            </div>
          </div>
          <div className="mobileNoticeContent">{getBatchNoticeDescription(batchInfo)}</div>
        </BatchModalWrap>
      ),
      confirmText: _l('关闭'),
    });
  };

  if (position === 'center') {
    return null;
  }

  return (
    <ModalWrap onClose={hideModalMessage} visible={visible} className="mobileNoticeWrap mobileModal minFull topRadius">
      <div className="flex overflowAuto">
        <div className="flexRow">
          <div className="flex mBottom16">
            {getIcon()}
            <span className="bold Font18 TxtBottom mLeft10">{title}</span>
          </div>
        </div>
        <div className="mobileNoticeContent">{description}</div>
      </div>
      <div className="btnsWrap flexRow mBottom20 mTop20">
        {btnList.reverse().map(item => (
          <div className="flex ellipsis btnItem" onClick={item.onClick}>
            {item.text}
          </div>
        ))}
      </div>
    </ModalWrap>
  );
}

const modalMessage = props => functionWrap(MessageComp, { ...props, closeFnName: 'hideModalMessage' });

export default modalMessage;
