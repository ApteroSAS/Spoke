import React, { Component } from "react";
import PropTypes from "prop-types";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import SelectInputIcons, { iconMap } from "../inputs/SelectInputIcons";
import StringInput from "../inputs/StringInput";
import BooleanInput from "../inputs/BooleanInput";
import { Running } from "styled-icons/fa-solid/Running";

const iconList = [
  { label: "VoiceOver", value: "VoiceOver" },
  { label: "Add", value: "Add" },
  { label: "Attach", value: "Attach" },
  { label: "Audio", value: "Audio" },
  { label: "Discord", value: "Discord" },
  { label: "Document", value: "Document" },
  { label: "Email", value: "Email" },
  { label: "Gif", value: "GIF" },
  { label: "Image", value: "Image" },
  { label: "Pen", value: "Pen" },
  { label: "Search", value: "Search" },
  { label: "Shield", value: "Shield" },
  { label: "Show", value: "Show" },
  { label: "Text Document", value: "TextDocument" },
  { label: "Video", value: "Video" },

]

const previewStyle = {
  height: '50px',
  filter: "brightness(0) invert(1)",
  padding: '0.3em'
}


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
  }

  onChangeAudioMode = value => {
    this.props.editor.setPropertySelected("audioMode", value);
  }

  onChangeUniversalAudio = value => {
    this.props.editor.setPropertySelected("universalAudio", value);
  }

  onChangeSidebarName = value => {
    this.props.editor.setPropertySelected("sidebarName", value);
  }

  onChangeLinkSource = value => {
    this.props.editor.setPropertySelected("linkSource", value);
  }

  onChangeButtonIcon = value => {
    this.props.editor.setPropertySelected("buttonIcon", value);
  }
  
  getIconSource = iconName => {
    return iconMap[iconName];
  }


  componentDidMount() {
  }

  render() {
    const { node } = this.props;

    const selectedIconSrc = this.getIconSource(node.buttonIcon);

    return (
      <NodeEditor description={TriggerNodeEditor.description} {...this.props}>
        <InputGroup name="Title name">
          <StringInput value={node.sidebarName} onChange={this.onChangeSidebarName} />
        </InputGroup>

        <InputGroup name="Audio mode" info="Use zone for Audio call">
          <BooleanInput value={node.audioMode} onChange={this.onChangeAudioMode} />
        </InputGroup>
        {(node.audioMode) ? (<>
          <InputGroup name="Universal Audio" info="Share Audio with ALL room instances">
            <BooleanInput value={node.universalAudio} onChange={this.onChangeUniversalAudio} />
          </InputGroup>
        </>) : (<>
          <InputGroup name="Link source">
            <StringInput value={node.linkSource} onChange={this.onChangeLinkSource} />
          </InputGroup>
        </>)
        }
        <InputGroup name="Button icon">
          <SelectInputIcons value={node.buttonIcon} onChange={this.onChangeButtonIcon} options={iconList} />
        </InputGroup>
        <InputGroup name="icon Preview">
          {selectedIconSrc && <img src={selectedIconSrc} alt={node.buttonIcon} style={previewStyle} />}
        </InputGroup>
      </NodeEditor>
    );
  }
}
