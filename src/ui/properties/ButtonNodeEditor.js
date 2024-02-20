import React, { Component } from "react";
import PropTypes from "prop-types";
import NodeEditor from "./NodeEditor";
import { Image } from "styled-icons/boxicons-regular/Image";
import SelectInput from "../inputs/SelectInput";
import InputGroup from "../inputs/InputGroup";
import useSetPropertySelected from "./useSetPropertySelected";
import StringInput from "../inputs/StringInput";
import PropertyGroup from "./PropertyGroup";
import BooleanInput from "../inputs/BooleanInput";
import NumericInput from "../inputs/NumericInput";


export default function ButtonNodeEditor(props) {
  const { editor, node } = props;
  const buttonTypeOptions = [
    { label: "Spawn", value: "spawn" },
    { label: "Animation", value: "animation" },
    { label: "Link", value: "Link" },
  ]
  const spawnSubModeOptions = [
    { label: "free", value: null },
    { label: "attach", value: "attach" },
  ]
  const urlSubModeOptions = [
    { label: "api", value: "API" },
    { label: "sidebar", value: "Sidebar" },
    { label: "redirection", value: "Redirection" },
    { label: "new tab", value: null },
  ]
  const urlModeOptions = [//rest_get and rest_post
    { label: "GET", value: "rest_get" },
    { label: "POST", value: "rest_post" }
  ]
  const btnStyleOptions = [//"rounded-button" | "rounded-text-action-button" | "rounded-action-button" | "rounded-text-button"
    { label: "rounded-button", value: "rounded-button" },
    { label: "rounded-text-action-button", value: "rounded-text-action-button" },
    { label: "rounded-action-button", value: "rounded-action-button" },
    { label: "rounded-text-button", value: "rounded-text-button" }
  ]

  
  const onChangeMode= useSetPropertySelected(editor, "mode");
  const onChangeAnimationName = useSetPropertySelected(editor, "actData");
  const onChangeObjectUrl = useSetPropertySelected(editor, "actUrl");
  const onChangeSubMode = useSetPropertySelected(editor, "subMode");
  const onChangeMediaframe = useSetPropertySelected(editor, "actMediaFrame");
  const onChangeAttribute = useSetPropertySelected(editor, "actAttribute");
  const onChangeApiMode = useSetPropertySelected(editor, "actMode");
  const onChangeApiData = useSetPropertySelected(editor, "actData");
  const onChangeApiConfig = useSetPropertySelected(editor, "actConfig");
  const onChangeSidebarTitle = useSetPropertySelected(editor, "actTitle");
  const onChangeBtnText = useSetPropertySelected(editor, "btnText");
  const onChangeBtnStyle = useSetPropertySelected(editor, "btnStyle");
  const onChangeBtnAuthorizationPermission = useSetPropertySelected(editor, "btnAuthorizationPermission");
  const onChangeBtnAuthorizationEmail = useSetPropertySelected(editor, "btnAuthorizationEmail");

  const onChangeLoop = useSetPropertySelected(editor, "actLoop");
  const onChangeRepeat = useSetPropertySelected(editor, "actRepeat");
  const onChangeSpeed = useSetPropertySelected(editor, "actSpeed");
  const onChangeReclick = useSetPropertySelected(editor, "actReclick");


  function findParentAnimations(node) {
    let animations = [];
    let parentNode = node.parent; // Assuming 'node' is your ButtonNode and has a reference to its parent
  
    while (parentNode) {
      const parentObject = parentNode.model;
      if (parentObject && parentObject.animations && parentObject.animations.length > 0) {
        animations = animations.concat(parentObject.animations.map(animation => animation.name));
      }
      parentNode = parentNode.parent; // Move up to the next parent
    }
  
    return animations;
  }
  
  const animationOptions = findParentAnimations(node).map(animationName => ({
    label: animationName,
    value: animationName
  }));

  return (
    <NodeEditor description={ButtonNodeEditor.description} {...props}>
      <PropertyGroup name="Appearance">
        <InputGroup name="Style" info="action mean a vibrant color, and text allows you to have text.">
          <SelectInput options={btnStyleOptions} value={node.btnStyle} onChange={onChangeBtnStyle} />
        </InputGroup>
        {
          (node.btnStyle === "rounded-text-button" || node.btnStyle === "rounded-text-action-button") && (
            <InputGroup name="Button Text">
              <StringInput value={node.btnText} onChange={onChangeBtnText} />
            </InputGroup>
          )
        }
        {
          (node.btnStyle === "rounded-button" || node.btnStyle === "rounded-action-button") && (
            <InputGroup name="Button Short Text">
              <StringInput value={node.btnText} onChange={onChangeBtnText} maxLength={3} />
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

        {node.mode === "animation" 
        && (!animationOptions || (animationOptions && animationOptions.length === 0)) 
        && (!node.parent || node.parent && !node.parent.model) 
        && (
          <div style={{ background: '#77000099', color: 'yellow', padding: '0.3em 0.6em' }}>
            ⚠ No valid Parent detected for this Button!
          </div>
        )}

        <InputGroup
          name="Type"
          info={`How to choose the types of button:
'Spawn' = Spawn linked element
'Animation' = Trigger named animation in first parent that has it
'Link' = for everything API and navigation related
`}
        >
          <SelectInput options={buttonTypeOptions} value={node.mode} onChange={onChangeMode} />
        </InputGroup>
        {
          node.mode === "spawn" && (
            <>
            <InputGroup
              name="Sub Mode"
              info={`How to choose the sub type of button:
'free' = spawn where the button is
'attach' = spawn where the mentioned MediaFrame is`}
            >
              <SelectInput options={spawnSubModeOptions} value={node.subMode} onChange={onChangeSubMode} />
            </InputGroup>
            <InputGroup name="Object url" info="url of the element to spawn.">
              <StringInput value={node.actUrl} onChange={onChangeObjectUrl} />
            </InputGroup>
            {node.subMode === "attach" && (
              <>
                <InputGroup name="Media Frame" info="Name of the Media frame to attach to.">
                  <StringInput value={node.actMediaFrame} onChange={onChangeMediaframe} />
                </InputGroup>
                <InputGroup name="Attributes  (Optional)" info="Attributes of the Media frame to attach to.">
                  <StringInput value={node.actAttribute} onChange={onChangeAttribute} />
                </InputGroup>
              </>
            )}
          </>
          )
        }
        {
          node.mode === "animation" && (
            <>
              <InputGroup name="Animation Name" info="Name of the animation to trigger. Must be present in one of the parents of the button.">
                <SelectInput
                options={animationOptions}
                value={node.actData} // This assumes 'actData' holds the selected animation name
                onChange={onChangeAnimationName}/>
              </InputGroup>

              <InputGroup name="Loop" info="Toggle infinite looping">
                <BooleanInput value={node.actLoop} onChange={onChangeLoop} />
              </InputGroup>
              <InputGroup disabled={node.actLoop} name="Repeat" info="Repeat a fixed number of times (default: 1)">
                <NumericInput value={node.actRepeat === undefined ? 1 : node.actRepeat} onChange={onChangeRepeat} min={1} precision={1} displayPrecision={1}/>
              </InputGroup>
              <InputGroup name="Speed" info="Speed of the animation 
0 = Pause/Resume
-1 = Stop and Reset
1 = Default speed">
                <NumericInput value={node.actSpeed === undefined ? 1 : node.actSpeed} onChange={onChangeSpeed} displayPrecision={0.1}/>
              </InputGroup>

              <InputGroup name="Reclick" info="Interaction if the button is clicked again while the animation is playing">
                <SelectInput options={[
                  { label: "Pause/Resume", value: 0 },
                  { label: "Reset & Play again", value: 1 },
                  { label: "Reset & Stop", value: 2 },
                ]} value={node.actReclick === undefined ? 0 : node.actReclick} onChange={onChangeReclick} />
              </InputGroup>
            </>
          )
        }
        {node.mode === "Link" && (
          <>
            <InputGroup name="Sub Mode" info={`How to choose the sub type of button:
'api' = trigger an API call that you can configure
'sidebar' = open a side pannel
'redirection' = change the url of the current page
'new tab' = open url in new tab, preferred over redirection`}>
              <SelectInput options={urlSubModeOptions} value={node.subMode} onChange={onChangeSubMode} />
            </InputGroup>
            <InputGroup name="URL">
              <StringInput value={node.actUrl} onChange={onChangeObjectUrl} />
            </InputGroup>
            {node.subMode === "API" && (
              <>
                <InputGroup name="Mode" info="GET or POST">
                  <SelectInput options={urlModeOptions} value={node.actMode} onChange={onChangeApiMode} />
                </InputGroup>
                <InputGroup name="Data (Optional)" info="JSON Data to send to the API.">
                  <StringInput value={node.actData} onChange={onChangeApiData} />
                </InputGroup>
                <InputGroup name="Config (Optional)" info="JSON Axios Config of the API call.">
                  <StringInput value={node.actConfig} onChange={onChangeApiConfig} />
                </InputGroup>
              </>
            )}
            {node.subMode === "Sidebar" && (
              <>
                <InputGroup name="Title" info="Title of the sidebar.">
                  <StringInput value={node.actTitle} onChange={onChangeSidebarTitle} />
                </InputGroup>
              </>
            )}
          </>
        )}

      </PropertyGroup>
    </NodeEditor>
  );
}

ButtonNodeEditor.iconComponent = Image;
ButtonNodeEditor.description ="A Button that can be used to trigger actions. You need to define a style and a behavior for it to work.";
ButtonNodeEditor.propTypes = {
  editor: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired
};