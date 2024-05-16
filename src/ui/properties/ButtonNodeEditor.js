import React, { Component, useCallback } from "react";
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
import { Button } from "../inputs/Button";


export default function ButtonNodeEditor(props) {
  const { editor, node } = props;
  const buttonTypeOptions = [
    { label: "Spawn", value: "spawn" },
    { label: "Animation", value: "animation" },
    { label: "Link", value: "Link" },
    { label: "Ai ", value: "ai_action" },
  ]
  const spawnSubModeOptions = [
    { label: "Free", value: null },
    { label: "Attach", value: "attach" },
  ]
  const urlSubModeOptions = [
    { label: "API", value: "API" },
    { label: "Sidebar", value: "Sidebar" },
    { label: "Redirection", value: "Redirection" },
    { label: "New tab", value: null },
  ]
  const urlModeOptions = [//rest_get and rest_post
    { label: "GET", value: "rest_get" },
    { label: "POST", value: "rest_post" }
  ]
  const btnStyleOptions = [//"rounded-button" | "rounded-text-action-button" | "rounded-action-button" | "rounded-text-button"
    { label: "Rounded Button", value: "rounded-button" },
    { label: "Rounded Action Button", value: "rounded-action-button" },
    { label: "Text Action Button", value: "rounded-text-action-button" },
    { label: "Text Button", value: "rounded-text-button" }
  ]

  // Button Style 
  const onChangeBtnText = useSetPropertySelected(editor, "btnText");
  const onChangeBtnStyle = useSetPropertySelected(editor, "btnStyle");
  const onChangeBtnAuthorizationPermission = useSetPropertySelected(editor, "btnAuthorizationPermission");
  const onChangeBtnAuthorizationEmail = useSetPropertySelected(editor, "btnAuthorizationEmail");
  // Button Behavior

  
  const onChangeArrayAct = useSetPropertySelected(editor, 'apteroActions');


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
              <StringInput value={node.btnText} onChange={onChangeBtnText} maxLength={5} />
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
        {node.config.actions.map((action, index) => (
          <div key={index}>
            {
              index !== 0 && 
              <hr 
                style={{ 
                  borderColor: "#5D646C",
                  marginTop: "1em",
                  marginBottom: "1em",
                }} 
              />
            }

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
              info={`How to choose the types of button:\n`+
                `'Spawn' = Spawn linked element\n`+
                `'Animation' = Trigger named animation in first parent that has it\n`+
                `'Link' = for everything API and navigation related\n`+
                `'Ai' = Notify the AI in the room that a button was clicked\n`
              }
            >
              <SelectInput
                options={buttonTypeOptions}
                value={action.mode}
                onChange={(newValue) => onChangeArrayAct([index, { mode: newValue }])}
              />
            </InputGroup>
            {
              action.mode === "spawn" && (
                <>
                <InputGroup
                  name="Sub Mode"
                  info={`How to choose the sub type of button:\n`+
                    `'free' = spawn where the button is\n`+
                    `'attach' = spawn where the mentioned MediaFrame is\n`}
                >
                  <SelectInput options={spawnSubModeOptions} value={action.subMode} onChange={(newValue) => onChangeArrayAct([index, { subMode: newValue }])} />
                </InputGroup>
                <InputGroup name="Object url" info="url of the element to spawn.">
                  <StringInput value={action.actUrl} onChange={(newValue) => onChangeArrayAct([index, { actUrl: newValue }])} />
                </InputGroup>
                {action.subMode === "attach" && (
                  <>
                    <InputGroup name="Media Frame" info="Name of the Media frame to attach to.">
                      <StringInput value={action.actMediaFrame} onChange={(newValue) => onChangeArrayAct([index, { actMediaFrame: newValue }])} />
                    </InputGroup>
                    <InputGroup name="Attributes  (Optional)" info="Attributes of the Media frame to attach to.">
                      <StringInput value={action.actAttribute} onChange={(newValue) => onChangeArrayAct([index, { actAttribute: newValue }])} />
                    </InputGroup>
                  </>
                )}
              </>
              )
            }
            {
              action.mode === "animation" && (
                <>
                  <InputGroup name="Animation Name" info="Name of the animation to trigger. Must be present in one of the parents of the button.">
                    <SelectInput
                      options={animationOptions}
                      value={action.actData}
                      onChange={(newValue) => onChangeArrayAct([index, { actData: newValue }])}
                    />
                  </InputGroup>

                  <InputGroup name="Loop" info="Toggle infinite looping">
                    <BooleanInput 
                      value={editor.selected[0].config.actions[index].actLoop}
                      onChange={(newValue) => onChangeArrayAct([index,{ actLoop: newValue}])}
                    />
                  </InputGroup>
                  <InputGroup disabled={action.actLoop} name="Repeat" info="Repeat a fixed number of times (default: 1)">
                    <NumericInput 
                      value={action.actRepeat === undefined ? 1 : action.actRepeat} 
                      onChange={(newValue) => onChangeArrayAct([index, { actRepeat: newValue }])}
                      min={1} precision={1} displayPrecision={1}
                    />
                  </InputGroup>
                  <InputGroup name="Speed" info={"Speed of the animation\n"+
                  "0 = Pause/Resume\n"+
                  "-1 = Stop and Reset\n"+
                  " 1 = Default speed\n"}>
                    <NumericInput 
                      value={action.actSpeed === undefined ? 1 : action.actSpeed} 
                      onChange={(newValue) => onChangeArrayAct([index, { actSpeed: newValue }])}
                      displayPrecision={0.1}
                    />
                  </InputGroup>

                  <InputGroup name="Reclick" info="Interaction if the button is clicked again while the animation is playing">
                    <SelectInput 
                      options={[
                        { label: "Pause/Resume", value: 0 },
                        { label: "Reset & Play again", value: 1 },
                        { label: "Reset & Stop", value: 2 },
                      ]} 
                      value={action.actReclick === undefined ? 0 : action.actReclick} 
                      onChange={(newValue) => onChangeArrayAct([index, { actReclick: newValue }])}
                    />
                  </InputGroup>
                </>
              )
            }
            {action.mode === "Link" && (
              <>
                <InputGroup name="Sub Mode" info={`How to choose the sub type of button:\n`+
                  `'api' = trigger an API call that you can configure\n`+
                  `'sidebar' = open a side pannel\n`+
                  `'redirection' = change the url of the current page\n`+
                  `'new tab' = open url in new tab, preferred over redirection\n`}>
                  <SelectInput options={urlSubModeOptions} value={action.subMode} onChange={(newValue) => onChangeArrayAct([index, { subMode: newValue }])} />
                </InputGroup>
                <InputGroup name="URL">
                  <StringInput value={action.actUrl} onChange={(newValue) => onChangeArrayAct([index, { actUrl: newValue }])} />
                </InputGroup>
                {action.subMode === "API" && (
                  <>
                    <InputGroup name="Mode" info="GET or POST">
                      <SelectInput options={urlModeOptions} value={action.actMode} onChange={(newValue) => onChangeArrayAct([index, { actMode: newValue }])} />
                    </InputGroup>
                    <InputGroup name="Data (Optional)" info="JSON Data to send to the API.">
                      <StringInput value={action.actData} onChange={(newValue) => onChangeArrayAct([index, { actData: newValue }])} />
                    </InputGroup>
                    <InputGroup name="Config (Optional)" info="JSON Axios Config of the API call.">
                      <StringInput value={action.actConfig} onChange={(newValue) => onChangeArrayAct([index, { actConfig: newValue }])} />
                    </InputGroup>
                  </>
                )}
                {action.subMode === "Sidebar" && (
                  <InputGroup name="Title" info="Title of the sidebar.">
                    <StringInput value={action.actTitle} onChange={(newValue) => onChangeArrayAct([index, { actTitle: newValue }]) } />
                  </InputGroup>
                )}
              </>
            )}
            {action.mode === "ai_action" && (<>
              <InputGroup name="Description" info="Description of the action to send to the AI">
                <StringInput value={action.description} onChange={(newValue) => onChangeArrayAct([index, { description: newValue }])} />
              </InputGroup>
              <InputGroup name="Reaction" info="If activated the Ai will react on the user action (only if an AI chat is visible to the user)">
                <BooleanInput value={action.triggerReaction} onChange={(newValue) => onChangeArrayAct([index,{ triggerReaction: newValue}])} />
              </InputGroup>
            </>)}

            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Button 
                onClick={() => onChangeArrayAct([-2,{}])}
                style={{ 
                  marginLeft: '8px',
                  marginTop: '2px'
                }}
              >Add Action</Button>
              
              <Button 
                onClick={() => onChangeArrayAct([-3,{index:index}])}
                style={{ 
                  marginLeft: '8px',
                  marginTop: '2px',
                  cursor: index === 0 ? 'not-allowed' : 'pointer',
                }}
                disabled = {index === 0}
              >Remove Action</Button>
            </div>
          </div>
        ))}
        
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