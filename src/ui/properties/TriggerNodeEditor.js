import React, { Component } from "react";
import PropTypes from "prop-types";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import SelectInput from "../inputs/SelectInput";
import BooleanInput from "../inputs/BooleanInput";
import StringInput from "../inputs/StringInput";
import { Running } from "styled-icons/fa-solid/Running";

const componentOptions = [
  {
    label: "audio-sub-room",
    value: "audio-sub-room",
    nodeNames: ["audio-system"],
    propertyOptions: [
      { label: "sub room id", value: "sub-room-id", component: "audio-sub-room", input: StringInput, default: "eg 'sub-room-1' or 'default'" }
    ]
  }
];

export default class TriggerNodeEditor extends Component {
  static propTypes = {
    editor: PropTypes.object,
    node: PropTypes.object,
    multiEdit: PropTypes.bool
  };

  static iconComponent = Running;

  static description = "Sets a property on avatar enter and leave.";

  constructor(props) {
    super(props);

    this.state = {
      options: [{label:"Audio System",value:"audio-system",nodeName:"audio-system"}]
    };
  }

  onChangeTarget = target => {
    this.props.editor.setPropertiesSelected({
      target,
      enterComponent: null,
      enterProperty: null,
      enterValue: null,
      leaveComponent: null,
      leaveProperty: null,
      leaveValue: null
    });
  };

  onChangeEnterComponent = value => {
    this.props.editor.setPropertiesSelected({
      enterComponent: value,
      enterProperty: null,
      enterValue: null
    });
  };

  onChangeEnterProperty = (value, option) => {
    this.props.editor.setPropertiesSelected({
      enterProperty: value,
      enterValue: option.default !== undefined ? option.default : null
    });
  };

  onChangeEnterValue = value => {
    this.props.editor.setPropertySelected("enterValue", value);
  };

  onChangeLeaveComponent = value => {
    this.props.editor.setPropertiesSelected({
      leaveComponent: value,
      leaveProperty: null,
      leaveValue: null
    });
  };

  onChangeLeaveProperty = (value, option) => {
    this.props.editor.setPropertiesSelected({
      leaveProperty: value,
      leaveValue: option.default !== undefined ? option.default : null
    });
  };

  onChangeLeaveValue = value => {
    this.props.editor.setPropertySelected("leaveValue", value);
  };

  componentDidMount() {
  }

  render() {
    const { node, multiEdit } = this.props;

    const targetOption = this.state.options.find(o => o.value === node.target);
    const target = targetOption ? targetOption.value : null;

    const filteredComponentOptions = targetOption
      ? componentOptions.filter(o => o.nodeNames.indexOf(targetOption.nodeName) !== -1)
      : [];
    const enterComponentOption = filteredComponentOptions.find(o => o.value === node.enterComponent);
    const enterComponent = enterComponentOption ? enterComponentOption.value : null;
    const leaveComponentOption = filteredComponentOptions.find(o => o.value === node.leaveComponent);
    const leaveComponent = leaveComponentOption ? leaveComponentOption.value : null;

    const filteredEnterPropertyOptions = enterComponentOption
      ? enterComponentOption.propertyOptions.filter(o => o.component === node.enterComponent)
      : [];
    const enterPropertyOption = filteredEnterPropertyOptions.find(o => o.value === node.enterProperty);
    const enterProperty = enterPropertyOption ? enterPropertyOption.value : null;

    const filteredLeavePropertyOptions = leaveComponentOption
      ? leaveComponentOption.propertyOptions.filter(o => o.component === node.leaveComponent)
      : [];
    const leavePropertyOption = filteredLeavePropertyOptions.find(o => o.value === node.leaveProperty);
    const leaveProperty = leavePropertyOption ? leavePropertyOption.value : null;

    const EnterInput = enterPropertyOption && enterPropertyOption.input;
    const LeaveInput = leavePropertyOption && leavePropertyOption.input;

    return (
      <NodeEditor description={TriggerNodeEditor.description} {...this.props}>
        <InputGroup name="Target">
          <SelectInput
            placeholder={"Select node..."}
            value={node.target}
            onChange={this.onChangeTarget}
            options={this.state.options}
            disabled={multiEdit}
          />
        </InputGroup>
        <InputGroup name="Enter Component">
          <SelectInput
            placeholder={node.enterComponent || "Select component..."}
            value={node.enterComponent}
            onChange={this.onChangeEnterComponent}
            options={filteredComponentOptions}
            disabled={multiEdit || !target}
          />
        </InputGroup>
        <InputGroup name="Enter Property">
          <SelectInput
            placeholder={node.enterProperty || "Select property..."}
            value={node.enterProperty}
            onChange={this.onChangeEnterProperty}
            options={filteredEnterPropertyOptions}
            disabled={multiEdit || !enterComponent}
          />
        </InputGroup>
        <InputGroup name="Enter Value">
          {EnterInput ? (
            <EnterInput
              value={node.enterValue}
              onChange={this.onChangeEnterValue}
              disabled={multiEdit || !(target && enterComponent && enterProperty)}
            />
          ) : (
            <StringInput disabled />
          )}
        </InputGroup>
        <InputGroup name="Leave Component">
          <SelectInput
            placeholder={node.leaveComponent || "Select component..."}
            value={node.leaveComponent}
            onChange={this.onChangeLeaveComponent}
            options={filteredComponentOptions}
            disabled={multiEdit || !target}
          />
        </InputGroup>
        <InputGroup name="Leave Property">
          <SelectInput
            placeholder={node.leaveProperty || "Select property..."}
            value={node.leaveProperty}
            onChange={this.onChangeLeaveProperty}
            options={filteredLeavePropertyOptions}
            disabled={multiEdit || !leaveComponent}
          />
        </InputGroup>
        <InputGroup name="Leave Value">
          {LeaveInput ? (
            <LeaveInput
              value={node.leaveValue}
              onChange={this.onChangeLeaveValue}
              disabled={multiEdit || !(target && leaveComponent && leaveProperty)}
            />
          ) : (
            <StringInput disabled />
          )}
        </InputGroup>
      </NodeEditor>
    );
  }
}
