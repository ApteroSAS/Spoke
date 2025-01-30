import React, { Component } from "react";
import PropTypes from "prop-types";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import SelectInputIcons, { iconMap } from "../inputs/SelectInputIcons";
import SelectInput from "../inputs/SelectInput";
import StringInput from "../inputs/StringInput";
import BooleanInput from "../inputs/BooleanInput";
import NumericInput from "../inputs/NumericInput";
import AudioZoneSVG from "../../assets/apteroelements/AudioZoneLogo.svg";
import Vector3Input from "../inputs/Vector3Input";
import { Button } from "../inputs/Button";
import FileUploader from './FileUploader';
import { InfoTooltip } from "../layout/Tooltip";


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

const systemList = [
  { label: "Enable", value: "room" },
  { label: "Disable (Guest Mode)", value: "guest" },
]

const AudioZoneLogo = React.forwardRef(({ className, style }, ref) => (
  <img
    src={AudioZoneSVG}
    className={className}
    ref={ref}
    style={{ ...style}}
    alt="Audio Zone Logo"
  />
));
const preloadImage = new Image();
preloadImage.src = AudioZoneSVG;


const previewStyle = {
  height: '50px',
  filter: "brightness(0) invert(1)",
  padding: '0.3em'
}

export default class TriggerAudioNodeEditor extends Component {
  static propTypes = {
    editor: PropTypes.object,
    node: PropTypes.object,
    multiEdit: PropTypes.bool
  };

  static iconComponent = AudioZoneLogo;

  static description = "Sets a property on avatar enter and leave.";

  // I decided to use a Local state to hold the URL of the models, so the model will ONLY be updated when we click the corresponding button
  constructor(props) {
    super(props);
    this.state = {
      localBarrierUrl: this.props.node.barrierUrl || "",
      localLogoUrl: this.props.node.logoUrl || ""
    };
  }
  componentDidUpdate(prevProps) {
    if (this.props.node !== prevProps.node) {
      this.setState({
        localBarrierUrl: this.props.node.barrierUrl || "",
        localLogoUrl: this.props.node.logoUrl || ""
      });
    }
  }

  handleLogoUpload = (newLogoUrl) => {
    this.setState({ localLogoUrl: newLogoUrl });
    this.onChangeLogoUrl(newLogoUrl);
  };
  handleBarrierUpload = (newBarrierUrl) => {
    this.setState({ localBarrierUrl: newBarrierUrl });
    this.onChangeBarrierUrl(newBarrierUrl);
  };


  onChangeUniversalAudio = value => {
    this.props.editor.setPropertySelected("universalAudio", value);
  }
  onChangeAudioChannel = value => {
    this.props.editor.setPropertySelected("audioChannel", value);
  }

  onChangeSystemMode = value => {
    this.props.editor.setPropertySelected("systemMode", value);
  }
  onChangeBarrierUrl = value => {
    this.props.editor.setPropertySelected("barrierUrl", value);
  }
  onChangeLogoUrl = value => {
    this.props.editor.setPropertySelected("logoUrl", value);
  }
  onChangeBarrierUserScale = value => {
    this.props.editor.setPropertySelected("barrierUserScale", value);
  }
  onChangeLogoUserScale = value => {
    this.props.editor.setPropertySelected("logoUserScale", value);
  }
  onChangeBarrierOffset = value => {
    this.props.editor.setPropertySelected("barrierOffset", value);
  }
  onChangeLogoOffset = value => {
    this.props.editor.setPropertySelected("logoOffset", value);
  }
  onChangeCustomTitle = value => {
    this.props.editor.setPropertySelected("customTitle", value);
  }

  onChangeSidebarName = value => {
    this.props.editor.setPropertySelected("sidebarName", value);
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
      <NodeEditor description={TriggerAudioNodeEditor.description} {...this.props}>
        <InputGroup name="Title name">
          <StringInput value={node.sidebarName} onChange={this.onChangeSidebarName} />
        </InputGroup>
        <InputGroup name="Voice group Name" info="Title of the call">
          <StringInput value={node.customTitle} onChange={this.onChangeCustomTitle} />
        </InputGroup>

        <InputGroup name="Audio Channel id" info="Share between audio zones">
          <NumericInput value={node.audioChannel} onChange={this.onChangeAudioChannel} precision={1} displayPrecision={1}/>
        </InputGroup>
        <InputGroup name="Universal Audio" info="Share Audio between ALL Room instances">
          <BooleanInput value={node.universalAudio} onChange={this.onChangeUniversalAudio} />
        </InputGroup>

        <InputGroup name="Button icon">
          <SelectInputIcons value={node.buttonIcon} onChange={this.onChangeButtonIcon} options={iconList} />
        </InputGroup>
        <InputGroup name="icon Preview">
          {selectedIconSrc && <img src={selectedIconSrc} alt={node.buttonIcon} style={previewStyle} />}
        </InputGroup>

        <InputGroup name="Allow Microphone" info="Enable the use of the Microphone for users inside (They can still listen)">
          <SelectInput value={node.systemMode} onChange={this.onChangeSystemMode} options={systemList} />
        </InputGroup>
        <InputGroup name="Logo Url" info="URL for the logo GLB model">
          <FileUploader // UPLOAD MODEL
            label="▲"
            hint="Upload GLB/GTLF"
            onUpload={this.handleLogoUpload}
            source={this.props.editor.sources[2]} //My assets
            multiple={false}
            accepts={[".glb", ".gltf"]}
            hideDefault={true}
          />
          <InfoTooltip info={"Reload model"}>
            <Button // RELOAD MODEL
              disabled = {this.state.localLogoUrl === this.props.node.logoUrl}
              onClick = {() => {
                this.onChangeLogoUrl(this.state.localLogoUrl);
              }}
              style={{ marginRight: '0.2em', marginLeft: '0.2em' }}
            >↻</Button>
          </InfoTooltip>

          <StringInput value={this.state.localLogoUrl} onChange={
            value => {
              this.setState({localLogoUrl: value});
            }
          } />
            
        </InputGroup>

        <InputGroup name="Logo Offset" info="Offset for the logo GLB model">
          <Vector3Input
            value={node.logoOffset}
            onChange={this.onChangeLogoOffset}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
          />
        </InputGroup>

        <InputGroup name="Logo Scale" info="Scale the logo GLB model">
          <Vector3Input
            uniformScaling
            value={node.logoUserScale}
            onChange={this.onChangeLogoUserScale}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
          />
        </InputGroup>


        <InputGroup name="Barrier Url" info="URL for the barrier GLB model">
          <FileUploader // UPLOAD MODEL
            label="▲"
            hint="Upload GLB/GTLF"
            onUpload={this.handleBarrierUpload}
            source={this.props.editor.sources[2]} //My assets
            multiple={false}
            accepts={[".glb", ".gltf"]}
            hideDefault={true}
          />
          <InfoTooltip info={"Reload model"}>
            <Button
              disabled = {this.state.localBarrierUrl === this.props.node.barrierUrl}
              onClick = {() => {
                this.onChangeBarrierUrl(this.state.localBarrierUrl);
              }}
              style={{ marginRight: '0.2em', marginLeft: '0.2em' }}
            >↻</Button>
          </InfoTooltip>

          <StringInput value={this.state.localBarrierUrl} onChange={
            value => {
              this.setState({localBarrierUrl: value});
            }
          } />
        </InputGroup>

        <InputGroup name="Barrier Offset" info="Offset for the barrier GLB model">
          <Vector3Input
            value={node.barrierOffset}
            onChange={this.onChangeBarrierOffset}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
          />
        </InputGroup>
        
        <InputGroup name="Barrier Scale" info="Scale the barrier GLB model">
          <Vector3Input
            uniformScaling
            value={node.barrierUserScale}
            onChange={this.onChangeBarrierUserScale}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
          />
        </InputGroup>
      </NodeEditor>
    );
  }
}
