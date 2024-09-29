import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import { RichText } from 'ming-ui';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';

export default class Widgets extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      width: props.width,
    };
  }

  componentDidMount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.SHOW);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.width !== this.props.width) {
      this.setState({
        width: nextProps.width,
      });
    }
  }

  onChange = _.debounce(value => {
    this.props.onChange(value);
  }, 500);

  handleBlur = () => {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.CHANGE);
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.BLUR);
    }
  };

  componentWillUnmount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.HIDE);
    }
  }

  render() {
    const {
      disabled,
      value,
      type,
      flag,
      richTextControlCount = 0,
      widgetStyle = {},
      triggerCustomEvent,
      advancedSetting = {},
    } = this.props;
    const { projectId, appId, worksheetId } = this.props;
    const { titlelayout_pc = '1', titlelayout_app = '1' } = widgetStyle;
    const { minheight, maxheight } = advancedSetting;
    const isMobile = browserIsMobile();
    const displayRow = isMobile ? titlelayout_app === '2' : titlelayout_pc === '2';
    const minHeight = isMobile ? 90 : Number(minheight || '90');
    const maxHeight = isMobile ? 500 : maxheight ? Number(maxheight) : undefined;
    return (
      <RichText
        projectId={projectId}
        appId={appId}
        worksheetId={worksheetId}
        clickInit={richTextControlCount >= 3}
        maxWidth={this.state.width}
        id={flag}
        data={value || ''}
        isRemark={type === 10010}
        className={cx({
          richTextForM: isMobile,
          richTextDisabledControl: disabled,
        })}
        disabled={disabled}
        onActualSave={this.onChange}
        onSave={() => {
          this.handleBlur();
        }}
        minHeight={minHeight}
        maxHeight={maxHeight}
        autoSize={{ height: displayRow ? 'auto' : '100%' }}
        handleFocus={() => triggerCustomEvent(ADD_EVENT_ENUM.FOCUS)}
      />
    );
  }
}
