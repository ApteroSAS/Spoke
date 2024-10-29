import React, { Component, useCallback, useState, useEffect } from "react";
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
import FileUploader from './FileUploader';
import { InfoTooltip } from "../layout/Tooltip";
import Vector3Input from "../inputs/Vector3Input";

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
    { label: "Text Button", value: "rounded-text-button" },
    { label: "Custom Model", value: "custom-button" }
  ]
  const onEndAnimation = [
    { label: "Reset", value: 0 },
    { label: "Pause", value: 1 },
    { label: "Loop Back", value: 2 },
  ]

  // Create a local state to store the input value before applying it
  const [localCustomModelUrl, setLocalCustomModelUrl] = useState(node.customModelUrl || "");
  const [buttonAnimationOptions, setButtonAnimationOptions] = useState([]);
  
  const onChangeCustomModelUrl = useSetPropertySelected(editor, "customModelUrl");
  const onChangeCustomModelScale = useSetPropertySelected(editor, "customModelScale");
  const onChangeCustomModelOffset = useSetPropertySelected(editor, "customModelOffset");
  const onChangeClickAnimation = useSetPropertySelected(editor, "clickAnimation");
  const onChangeClickAnimationSpeed = useSetPropertySelected(editor, "clickAnimationSpeed");
  const onChangeHoverAnimation = useSetPropertySelected(editor, "hoverAnimation");
  const onChangeHoverAnimationSpeed = useSetPropertySelected(editor, "hoverAnimationSpeed");

  const updateButtonAnimationOptions = () => {
    const animations = node.config.customAnimations || [];
    const options = animations.map((anim) => ({
      label: anim.name,
      value: anim.name,
    }));
    setButtonAnimationOptions(options.length > 0 ? options : [{ label: "None", value: "" }]);
  };

  // Update the animations when node.config.customAnimations changes
  useEffect(() => {
    updateButtonAnimationOptions();
  }, [node.config.customAnimations]);

  const handleCustomModelUpload = async (newCustomModelUrl) => {
    try {
      // Update local state and set the custom model URL
      setLocalCustomModelUrl(newCustomModelUrl);
      onChangeCustomModelUrl(newCustomModelUrl);
      // Reload the model and update animations
      await node.onReloadModel();
      updateButtonAnimationOptions();
    } catch (error) {
      console.error('Error uploading model:', error);
    }
  };

  const handleReloadModel = async () => {
    try {
      // Set the custom model URL first
      onChangeCustomModelUrl(localCustomModelUrl);

      console.log("B")
  
      // Wait for the model to reload
      await node.onReloadModel();
  
      // Update the animation options after the model reloads
      updateButtonAnimationOptions();
    } catch (error) {
      console.error('Error reloading model:', error);
    }
  };

  // Get all media-frame objects
  const getMediaFrameOptions = () => {
    const mediaFrames = [];
    editor.scene.traverse((obj) => {
      if (obj.nodeName === "media-frame" || obj.nodeName === "Media Frame") {
        mediaFrames.push({ label: obj.name, value: obj.name });
      }
    });
    return mediaFrames;
  };

  // Get the current list of media frames dynamically when needed
  const mediaFrameOptions = getMediaFrameOptions();


  // Button Style 
  const onChangeBtnText = useSetPropertySelected(editor, "btnText");
  const onChangeBtnStyle = useSetPropertySelected(editor, "btnStyle");
  const onChangeBtnAuthorizationPermission = useSetPropertySelected(editor, "btnAuthorizationPermission");
  const onChangeBtnAuthorizationEmail = useSetPropertySelected(editor, "btnAuthorizationEmail");
  // Button Behavior

  
  const onChangeArrayAct = useSetPropertySelected(editor, 'apteroActions');


  function findParentAnimations(node) {
    let animList = [];
    let parentNode = node.parent; // Assuming 'node' is your ButtonNode and has a reference to its parent
  
    while (parentNode) {
      const parentObject = parentNode.model;
      // Fill animList with the animations, the parent uuid, and the object name
      if (parentObject && parentObject.animations && parentObject.animations.length > 0) {
        animList = animList.concat(parentObject.animations.map(animation => ({
          label: animation.name,
          value: parentNode.uuid, // We set the id only at first, for checking purposes
          parentName: parentNode.name,
        })));
      }

      parentNode = parentNode.parent; // Move up to the next parent
    }

    // Add the name of the parent object IF we have more than one
    if (animList.length > 0) {
      let lastObject = null;
      let objectCount = 0;

      for (let i = 0; i < animList.length; i++) {
        if (lastObject !== animList[i].value) {
          lastObject = animList[i].value;
          objectCount++;
        }
      }

      for (let i = 0; i < animList.length; i++) {
        let objectId = animList[i].value;
        let parentName = animList[i].parentName;
        let animationName = animList[i].label;
        if (objectCount > 1) {
          animList[i].label = parentName + " / " + animationName;
        }
        // We now set the PROPER value here
        animList[i].value = animationName + "_" + objectId ;
      }
    }
    return animList;
  }
  
  const animationOptions = findParentAnimations(node);

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

        {node.btnStyle === "custom-button" && (
          <>
            <InputGroup name="Custom Model URL" info="URL for the custom button GLB model">
              <FileUploader
                label="▲"
                hint="Upload GLB/GTLF"
                onUpload={handleCustomModelUpload}
                source={editor.sources[2]} // My assets
                multiple={false}
                accepts={[".glb", ".gltf"]}
              />
              <InfoTooltip info={"Reload model"}>
                <Button
                  disabled={localCustomModelUrl === "" || localCustomModelUrl === undefined}
                  onClick={handleReloadModel}
                  style={{ marginRight: "0.2em", marginLeft: "0.2em" }}
                >
                  ↻
                </Button>
              </InfoTooltip>
              <StringInput
                value={localCustomModelUrl}
                onChange={(value) => setLocalCustomModelUrl(value)}
              />
            </InputGroup>

            <InputGroup name="Custom Model Offset" info="Offset for the custom button GLB model">
              <Vector3Input
                value={node.customModelOffset}
                onChange={onChangeCustomModelOffset}
                smallStep={0.01}
                mediumStep={0.1}
                largeStep={1}
              />
            </InputGroup>

            <InputGroup name="Custom Model Scale" info="Scale for the custom button GLB model">
              <Vector3Input
                uniformScaling
                value={node.customModelScale}
                onChange={onChangeCustomModelScale}
                smallStep={0.01}
                mediumStep={0.1}
                largeStep={1}
              />
            </InputGroup>

            <InputGroup name="Click Animation">
              <SelectInput
                options={buttonAnimationOptions}
                value={node.clickAnimation}
                onChange={onChangeClickAnimation}
              />
            </InputGroup>
            <InputGroup name="Click Animation Speed">
              <NumericInput
                value={node.clickAnimationSpeed === undefined ? 1 : node.clickAnimationSpeed}
                onChange={onChangeClickAnimationSpeed}
                min={0.1}
                max={5}
                step={0.1}
              />
            </InputGroup>

            <InputGroup name="Hover Animation">
              <SelectInput
                options={buttonAnimationOptions}
                value={node.hoverAnimation}
                onChange={onChangeHoverAnimation}
              />
            </InputGroup>
            <InputGroup name="Hover Animation Speed">
              <NumericInput
                value={node.hoverAnimationSpeed === undefined ? 1 : node.hoverAnimationSpeed}
                onChange={onChangeHoverAnimationSpeed}
                min={0.1}
                max={5}
                step={0.1}
              />
            </InputGroup>


          </>
        )}

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
                value={editor.selected[0].config.actions[index].mode}
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
                  <SelectInput 
                    options={spawnSubModeOptions} 
                    value={editor.selected[0].config.actions[index].subMode}
                    onChange={(newValue) => onChangeArrayAct([index, { subMode: newValue }])} 
                  />
                </InputGroup>
                <InputGroup name="Object url" info="url of the element to spawn.">
                  <StringInput 
                    value={editor.selected[0].config.actions[index].actUrl}
                    onChange={(newValue) => onChangeArrayAct([index, { actUrl: newValue }])} 
                  />
                </InputGroup>
                {action.subMode === "attach" && (
                  <>
                    <InputGroup name="Media Frame" info="Name of the Media frame to attach to.">
                    <SelectInput
                      options={mediaFrameOptions}
                      value={editor.selected[0].config.actions[index].actMediaFrame}
                      onChange={(newValue) => onChangeArrayAct([index, { actMediaFrame: newValue }])}
                    />
                    </InputGroup>
                    <InputGroup name="Attributes  (Optional)" info="Attributes of the Media frame to attach to.">
                      <StringInput 
                        value={editor.selected[0].config.actions[index].actAttribute}
                        onChange={(newValue) => onChangeArrayAct([index, { actAttribute: newValue }])} 
                      />
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
                      value={editor.selected[0].config.actions[index].actData}
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
                      value={editor.selected[0].config.actions[index].actRepeat === undefined ? 1 : 
                             editor.selected[0].config.actions[index].actRepeat}
                      onChange={(newValue) => onChangeArrayAct([index, { actRepeat: newValue }])}
                      min={1} precision={1} displayPrecision={1}
                    />
                  </InputGroup>
                  <InputGroup name="Speed" info="Speed of the animation 
1 = Default speed
-1 = Reverse
2 = 2x Speed">
                    <NumericInput 
                      value={editor.selected[0].config.actions[index].actSpeed === undefined ? 1 : 
                             editor.selected[0].config.actions[index].actSpeed}
                      onChange={(newValue) => onChangeArrayAct([index, { actSpeed: newValue }])}
                      displayPrecision={0.1}
                    />
                  </InputGroup>

                  <InputGroup name="Click" info="Interaction if the button is clicked when NO animation is playing (or is paused)">
                    <SelectInput 
                      options={[
                        { label: "Play/Resume", value: 0 },
                        { label: "Reset", value: 1 },
                        { label: "Stop", value: 2 },
                        { label: "Do nothing", value: 3 },
                      ]} 
                      value={editor.selected[0].config.actions[index].actMainclick === undefined ? 0 :
                             editor.selected[0].config.actions[index].actMainclick}
                      onChange={(newValue) => onChangeArrayAct([index, { actMainclick: newValue }])}
                    />
                  </InputGroup>

                  <InputGroup name="Reclick" info="Interaction if the button is clicked again while the animation is playing">
                    <SelectInput 
                      options={[
                        { label: "Pause", value: 0 },
                        { label: "Reset", value: 1 },
                        { label: "Stop", value: 2 },
                        { label: "Do nothing", value: 3 },
                      ]} 
                      value={editor.selected[0].config.actions[index].actReclick === undefined ? 0 :
                             editor.selected[0].config.actions[index].actReclick}
                      onChange={(newValue) => onChangeArrayAct([index, { actReclick: newValue }])}
                    />
                  </InputGroup>
                  <InputGroup name="On End" info="Action to take when the animation ends">
                    <SelectInput
                      options={onEndAnimation}
                      value={editor.selected[0].config.actions[index].actOnEnd}
                      onChange={(newValue) => onChangeArrayAct([index, { actOnEnd: newValue }])}
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
                  <SelectInput options={urlSubModeOptions} 
                    value={editor.selected[0].config.actions[index].subMode}
                    onChange={(newValue) => onChangeArrayAct([index, { subMode: newValue }])} 
                  />
                </InputGroup>
                <InputGroup name="URL">
                  <StringInput value={action.actUrl} onChange={(newValue) => onChangeArrayAct([index, { actUrl: newValue }])} />
                </InputGroup>
                {action.subMode === "API" && (
                  <>
                    <InputGroup name="Mode" info="GET or POST">
                      <SelectInput options={urlModeOptions} 
                        value={editor.selected[0].config.actions[index].actMode}
                        onChange={(newValue) => onChangeArrayAct([index, { actMode: newValue }])} 
                      />
                    </InputGroup>
                    <InputGroup name="Data (Optional)" info="JSON Data to send to the API.">
                      <StringInput 
                        value={editor.selected[0].config.actions[index].actData} 
                        onChange={(newValue) => onChangeArrayAct([index, { actData: newValue }])} 
                      />
                    </InputGroup>
                    <InputGroup name="Config (Optional)" info="JSON Axios Config of the API call.">
                      <StringInput 
                        value={editor.selected[0].config.actions[index].actConfig}
                        onChange={(newValue) => onChangeArrayAct([index, { actConfig: newValue }])} 
                      />
                    </InputGroup>
                  </>
                )}
                {action.subMode === "Sidebar" && (
                  <InputGroup name="Title" info="Title of the sidebar.">
                    <StringInput 
                      value={editor.selected[0].config.actions[index].actTitle}
                      onChange={(newValue) => onChangeArrayAct([index, { actTitle: newValue }]) } 
                    />
                  </InputGroup>
                )}
              </>
            )}
            {action.mode === "ai_action" && (<>
              <InputGroup name="Description" info="Description of the action to send to the AI">
                <StringInput 
                  value={editor.selected[0].config.actions[index].description}
                  onChange={(newValue) => onChangeArrayAct([index, { description: newValue }])} 
                />
              </InputGroup>
              <InputGroup name="Reaction" info="If activated the Ai will react on the user action (only if an AI chat is visible to the user)">
                <BooleanInput 
                  value={editor.selected[0].config.actions[index].triggerReaction}
                  onChange={(newValue) => onChangeArrayAct([index,{ triggerReaction: newValue}])} 
                />
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