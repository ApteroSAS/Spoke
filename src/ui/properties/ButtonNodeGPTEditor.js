import React, { Component } from "react";
import PropTypes from "prop-types";
import NodeEditor from "./NodeEditor";
import { Image } from "styled-icons/boxicons-regular/Image";
import SelectInput from "../inputs/SelectInput";
import InputGroup from "../inputs/InputGroup";
import InputGroupExpandable from "../inputs/InputGroupExpandable";
import useSetPropertySelected from "./useSetPropertySelected";
import StringInput from "../inputs/StringInput";
import StringInputExpandable from "../inputs/StringInputExpandable";
import PropertyGroup from "./PropertyGroup";
import BooleanInput from "../inputs/BooleanInput";
import Slider from "../inputs/Slider";
import ColorInput from "../inputs/ColorInput";
import NumericInput from "../inputs/NumericInput";
import ChatGPTLogo from "../../assets/ChatGPTLogo.svg";
import { Button } from "../inputs/Button";

export default function ButtonNodeGPTEditor(props) {
  const { editor, node } = props;
  console.log(node)

  const buttonGPTModels = [
    { label: "GPT-3.5", value: "gpt-3.5-turbo" },
    { label: "GPT-3.5 16k", value: "gpt-3.5-turbo-16k" },
    { label: "GPT-4", value: "gpt-4" },
    //{ label: "invalid for testing", value: "test" },
  ]
  const btnStyleOptions = [//"rounded-button" | "rounded-text-action-button" | "rounded-action-button" | "rounded-text-button"
    { label: "rounded-button", value: "rounded-button" },
    { label: "rounded-text-action-button", value: "rounded-text-action-button" },
    { label: "rounded-action-button", value: "rounded-action-button" },
    { label: "rounded-text-button", value: "rounded-text-button" }
  ]

  
  const onChangeObjectUrl = useSetPropertySelected(editor, "actUrl");
  const onChangeSidebarTitle = useSetPropertySelected(editor, "actTitle");
  const onChangeBtnText = useSetPropertySelected(editor, "btnText");
  const onChangeBtnStyle = useSetPropertySelected(editor, "btnStyle");
  const onChangeBtnAuthorizationPermission = useSetPropertySelected(editor, "btnAuthorizationPermission");
  const onChangeBtnAuthorizationEmail = useSetPropertySelected(editor, "btnAuthorizationEmail");

  const onChangeGptModel = useSetPropertySelected(editor, "gptModel");
  const onChangeGptIgnorecache = useSetPropertySelected(editor, "gptIgnorecache");
  const onChangeGptIntro = useSetPropertySelected(editor, "gptIntro");
  const onChangeGptSticky = useSetPropertySelected(editor, "gptSticky");
  const onChangeGptCustomImg = useSetPropertySelected(editor, "gptCustomImg");
  const onChangeGptCustomImgRound = useSetPropertySelected(editor, "gptCustomImgRound");
  const onChangeGptCustomGreetings = useSetPropertySelected(editor, "gptCustomGreetings");
  const onChangeGptCustomColor = useSetPropertySelected(editor, "gptCustomColor");
  const onChangeGptCustomDescription = useSetPropertySelected(editor, "gptCustomDescription");
  const onChangeGptCustomBackground = useSetPropertySelected(editor, "gptCustomBackground");
  const onChangeGptCustomIconUser = useSetPropertySelected(editor, "gptCustomIconUser");
  const onChangeGptCustomIconAssistant = useSetPropertySelected(editor, "gptCustomIconAssistant");


  return (
    <NodeEditor {...props} description={ButtonNodeGPTEditor.description}>
      <PropertyGroup name="Appearance">
        <InputGroup name="Style" info="action mean a vibrant color, and text allows you to have text.">
          <SelectInput options={btnStyleOptions} value={node.btnStyle} onChange={onChangeBtnStyle} />
        </InputGroup>
        {
          (node.btnStyle === "rounded-text-button" || node.btnStyle=== "rounded-text-action-button") && (
            <InputGroup name="Button Text">
              <StringInput value={node.btnText} onChange={onChangeBtnText} />
            </InputGroup>
          )
        }
        <InputGroup name="Authorization Permission (Optional)" info='Permission required to see the button. One of "tweet", "spawn_camera", "spawn_drawing", "spawn_and_move_media", "pin_objects", "spawn_emoji", "fly", "update_hub", "update_hub_promotion", "update_roles", "close_hub", "mute_users", "kick_users", "change_screen", "show_spawn_and_move_media", "share_screen"'>
          <StringInput value={node.btnAuthorizationPermission} onChange={onChangeBtnAuthorizationPermission} />
        </InputGroup>
        <InputGroup name="Authorization Email (Optional)" info="User must be logged with Email to see the button. Must be list separated by ',' like ab@cd.ef,gh@ij.kl">
          <StringInput value={node.btnAuthorizationEmail} onChange={onChangeBtnAuthorizationEmail} />
        </InputGroup>
      </PropertyGroup>

      <PropertyGroup name="Behavior">
      <InputGroup name="Title" info="Title of the sidebar.">
        <StringInput value={node.actTitle} onChange={onChangeSidebarTitle} />
      </InputGroup>

      <InputGroup name="GPT Model">
        <SelectInput options={buttonGPTModels} value={node.gptModel} onChange={onChangeGptModel} />
      </InputGroup>

      <InputGroupExpandable name="ChatGPT System configuration (Optional)" info='Set ChatGPT System parameters (Example: You are a dog and should only respond in barks)'>
        <StringInputExpandable value={node.actUrl} onChange={onChangeObjectUrl} />
      </InputGroupExpandable>
      </PropertyGroup>

      <PropertyGroup name="Header Profile">
      <InputGroup name="Profile image (url)" info="Modify the image that appears on top of the header">
        <StringInput value={node.gptCustomImg} onChange={onChangeGptCustomImg}/>
      </InputGroup>
      <InputGroup name="Profile Round border (0%-100%)" info="Round the borders of the Custom image">
        <Slider min={0} max={100} step={1} value={node.gptCustomImgRound} onChange={onChangeGptCustomImgRound} />
        <NumericInput min={0} max={100} step={1} mediumStep={1} value={node.gptCustomImgRound} onChange={onChangeGptCustomImgRound} />
      </InputGroup>
      <InputGroup name="Stick Header on top" info="Make the Header stick to the top when you scroll down">
        <BooleanInput value={node.gptSticky} onChange={onChangeGptSticky}/>
      </InputGroup>
      
      <InputGroup name="Greetings Message" info="Display a Greetings message on top. Use [BRACKETS] for the name (Example: Hello! I'm [Aptero]'s AI!)">
        <StringInput value={node.gptCustomGreetings} onChange={onChangeGptCustomGreetings}/>
      </InputGroup>
      <InputGroup name="Name color" info="Set the color of the name displayed on the Greetings">
        <ColorInput value={node.gptCustomColor} onChange={onChangeGptCustomColor}/>
      </InputGroup>
      <InputGroup name="Description (Optional)" info="A sub-text for the Greetings">
        <StringInput value={node.gptCustomDescription} onChange={onChangeGptCustomDescription}/>
      </InputGroup>
      </PropertyGroup>

      <PropertyGroup name="Chat">
      <InputGroup name="Ignore Cache" info="Enable this option to open a clean chat everytime">
        <BooleanInput value={node.gptIgnorecache} onChange={onChangeGptIgnorecache}/>
      </InputGroup>
      <InputGroup name="First message (Optional)" info="Set the first message from the Bot">
        <StringInput value={node.gptIntro} onChange={onChangeGptIntro}/>
      </InputGroup>
      
      <InputGroup name="Background (Optional)" info="Choose the background of the whole page">
        <StringInput value={node.gptCustomBackground} onChange={onChangeGptCustomBackground}/>
      </InputGroup>
      <InputGroup name="User icon (Optional, url)" info="Set the User icon that is displayed on the left part of the messages">
        <StringInput value={node.gptCustomIconUser} onChange={onChangeGptCustomIconUser}/>
      </InputGroup>
      <InputGroup name="Assistant icon (Optional, url)" info="Set the bot icon that is displayed on the left part of the messages">
        <StringInput value={node.gptCustomIconAssistant} onChange={onChangeGptCustomIconAssistant}/>
      </InputGroup>

      </PropertyGroup>
    </NodeEditor>
  );
}

//We need to convert the SVG into a React component just like the Image component 
const gptLogo = React.forwardRef(({ className, style }, ref) => (
  <img
    src={ChatGPTLogo}
    className={className}
    ref={ref}
    style={{ ...style}}
    alt="ChatGPT Logo"
  />
));

/*
console.log("!!------Image------")
console.log(Image)
console.log("--------------------")
console.log(gptLogo)
console.log("------Image------!!")
*/

ButtonNodeGPTEditor.iconComponent = gptLogo;
ButtonNodeGPTEditor.description ="A Button that opens ChatGPT.";
ButtonNodeGPTEditor.propTypes = {
  editor: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired
};