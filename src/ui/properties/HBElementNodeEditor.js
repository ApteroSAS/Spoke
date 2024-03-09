import React, { Component } from "react";
import PropTypes from "prop-types";
import configs from "../../configs";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import StringInput from "../inputs/StringInput";
import HyperbeamSVG from "../../assets/apteroelements/HyperbeamLogo.svg";
import BooleanInput from "../inputs/BooleanInput";
import SelectInput from "../inputs/SelectInput";
import Slider from "../inputs/Slider";
import NumericInput from "../inputs/NumericInput";
import PropertyGroup from "./PropertyGroup";
import CompoundNumericInput from "../inputs/CompoundNumericInput";
import NumericInputGroup from "../inputs/NumericInputGroup";
import SoundCurvePreview from "../inputs/SoundCurvePreview";
import LocalHide from "./LocalHide";

import { Button } from "../inputs/Button";
import styled from "styled-components";
import Collapsible from "../inputs/Collapsible";
import {
  AudioType as AudioTypeList,
  AudioTypeOptions,
  Defaults,
  DistanceModelOptions,
  DistanceModelType,
  SourceType
} from "../../editor/objects/AudioParams";


let fetchfrom = 'https://hyperbeam.serverless.aptero.co/';
  // If we are running from localhost, fetch directly using CORS proxy
  if (window.location.hostname === "localhost") {
    /*/  <---Comment switch:  [ / * / <==> / / * / ]
    const proxyURL = 'https://corsproxy.aptero.co/';
    const serverOrigin = 'https://hyperbeam.serverless.aptero.co/';
    fetchfrom = proxyURL+serverOrigin
    /*/
    fetchfrom = "http://localhost:8286/"
    /**/
  }

const DInputGroup = styled.div`
    & > div {
      display: none;
    }
  `;
const DButton = styled.div`
    & > div {
      display: none;
    }
  `;

//We need to convert the SVG into a React component just like the Image component 
const HyperbeamLogo = React.forwardRef(({ className, style }, ref) => (
  <img
    src={HyperbeamSVG}
    className={className}
    ref={ref}
    style={{ ...style}}
    alt="Hyperbeam Logo"
  />
));
const preloadImage = new Image();
preloadImage.src = HyperbeamSVG;

const HBRegionList = [
  { label: "North America", value: "NA" },
  { label: "Europe", value: "EU" },
  { label: "Asia", value: "AS" },
]
const HBResList = [
  { label: "SD (480p)", value: 480 },
  { label: "HD (720p)", value: 720 },
  { label: "HD+ (900p)", value: 900 },
  { label: "Full HD (1080p)", value: 1080 },
]
const HBQltyList = [
  { label: "Smooth", value: "smooth" },
  { label: "Sharp", value: "sharp" },
]
const youtubeCCLangs = [
  { label: "English", value: "en"},
  { label: "French", value: "fr"},
  { label: "Spanish", value: "es"},
  { label: "Korean", value: "ko"},
  { label: "Chinese", value: "zh"},
  { label: "German", value: "de"},
  { label: "Portuguese", value: "pt"},
  { label: "Russian", value: "ru"},
  { label: "Japanese", value: "ja"},
]

/* 
  System to calculate bandwidth based on resolution, fps and quality settings
  https://docs.hyperbeam.com/home/faq#streaming
*/
function interpolateBandwidth(base24, base30, fps) {
  // Linear interpolation between 24fps and 30fps values
  const slope = (base30 - base24) / (30 - 24);
  return base24 + slope * (fps - 24);
}

function calculateBandwidth(resolution, fps, quality) {
  // Base bandwidth values for 24fps and 30fps at different resolutions
  const baseBandwidth = {
      480: { base24: 3, base30: 3.8 },
      720: { base24: 5, base30: 6.3 },
      900: { base24: 7.8, base30: 9.8 },
      1080: { base24: 11.3, base30: 14.1 }
  };

  // Interpolate bandwidth based on FPS
  let bandwidth = interpolateBandwidth(
      baseBandwidth[resolution].base24, 
      baseBandwidth[resolution].base30, 
      fps
  );

  // Adjust for quality setting
  if (quality === "sharp") {
      bandwidth *= 3;
  }

  return bandwidth;
}

function getBandwidthCategory(bandwidth) {
  if (bandwidth <= 7) {
      return 'Optimal';
  } else if (bandwidth <= 12) {
      return 'Standard';
  } else if (bandwidth <= 29) {
      return '⚠ Intensive';
  } else {
      return 'Too High';
  }
}


const setProperty = (editor, property, value) => {
  if (editor && typeof editor.setPropertySelected === 'function') {
    editor.setPropertySelected(property, value);
  } else {
    console.error('Editor is not defined or setPropertySelected is not a function');
  }
};

export default class HBElementNodeEditor extends Component {
  static propTypes = {
    editor: PropTypes.object,
    node: PropTypes.object,
  };

  static iconComponent = HyperbeamLogo;
  static description = `A 3D Element that allows multiple users to browse the web on the same 3D screen.`;

  

  // Properties that will appear on the right side when you select the node
  onChangeHref = href => {
    this.props.editor.setPropertySelected("href", href);

    // Check if it's a youtube link
    if (href.includes("youtube.com/watch?v=") || href.includes("youtu.be/")) {
      this.props.editor.setPropertySelected("isYoutubeLink", true);
    } else {
      this.props.editor.setPropertySelected("isYoutubeLink", false);
    }
  };

  onChangeRegion = HBRegion => setProperty(this.props.editor, "HBRegion", HBRegion);
  onChangeHBBrowserNav = HBBrowserNav => setProperty(this.props.editor, "HBBrowserNav", HBBrowserNav);
  onChangeHBDarkMode = HBDarkMode => setProperty(this.props.editor, "HBDarkMode", HBDarkMode);
  onChangeHBWebGL = HBWebGL => setProperty(this.props.editor, "HBWebGL", HBWebGL);
  onChangeHBRes = HBRes => setProperty(this.props.editor, "HBRes", HBRes);
  onChangeHBFps = HBFps => setProperty(this.props.editor, "HBFps", HBFps);
  onChangeHBQlty = HBQlty => setProperty(this.props.editor, "HBQlty", HBQlty);
  onChangeHBuBlock = HBuBlock => setProperty(this.props.editor, "HBuBlock", HBuBlock);
  onChangeHBNoCursors = HBNoCursors => setProperty(this.props.editor, "HBNoCursors", HBNoCursors);
  onChangeHBFalloffDistance = HBFalloffDistance => setProperty(this.props.editor, "HBFalloffDistance", HBFalloffDistance);
  onChangeYoutubeCC = youtubeCC => setProperty(this.props.editor, "youtubeCC", youtubeCC);
  onChangeyoutubeCCLang = youtubeCCLang => setProperty(this.props.editor, "youtubeCCLang", youtubeCCLang);
  onChangeyoutubeCCLangOther = youtubeCCLangOther => setProperty(this.props.editor, "youtubeCCLangOther", youtubeCCLangOther);
  onChangeYoutubePlaylistID = youtubePlaylistID => setProperty(this.props.editor, "youtubePlaylistID", youtubePlaylistID);
  onChangeYoutubeLoop = youtubeLoop => setProperty(this.props.editor, "youtubeLoop", youtubeLoop);
  onChangeHBStready = HBStready => setProperty(this.props.editor, "HBStready", HBStready);
  onChangeRestricted = HBRestricted => setProperty(this.props.editor, "HBRestricted", HBRestricted);
  onChangeHBForceYoutube = HBForceYoutube => setProperty(this.props.editor, "HBForceYoutube", HBForceYoutube);
  onChangeYoutubeAutoPlay = youtubeAutoPlay => setProperty(this.props.editor, "youtubeAutoPlay", youtubeAutoPlay);
  onChangeHBAdvancedAudio = HBAdvancedAudio => setProperty(this.props.editor, "HBAdvancedAudio", HBAdvancedAudio);
  
  onChangeUniversalStream = universalStream => setProperty(this.props.editor, "universalStream", universalStream);


  onProcessSession = processingSession => setProperty(this.props.editor, "processingSession", processingSession);

  onChangeShowAudioSphere = showAudioSphere => setProperty(this.props.editor, "showAudioSphere", showAudioSphere);
  onChangeShowAudioOuter = showAudioOuter => setProperty(this.props.editor, "showAudioOuter", showAudioOuter);
  onChangeShowAudioInner = showAudioInner => setProperty(this.props.editor, "showAudioInner", showAudioInner);

  onChangeHBPersistent = async HBPersistent => {
    this.props.editor.setPropertySelected("HBPersistent", HBPersistent);

    // Check if session is still valid if defined
    if (this.props.node.HBSession && HBPersistent) { // Redundant, but it saves some processing
      this.handleSession(false);
    }
  }
  
  onChangePermissions = (permission) => {
    let permissions = {...this.props.node.HBPermissions};
    if (permissions[permission]) {
      delete permissions[permission];
    } else {
      permissions[permission] = true;
    }
    this.props.editor.setPropertySelected("HBPermissions", permissions);
  }

  onChangeAudioType = audioType => setProperty(this.props.editor, "audioType", audioType);
  onChangeGain = gain => setProperty(this.props.editor, "gain", gain);
  onChangeDistanceModel = distanceModel => setProperty(this.props.editor, "distanceModel", distanceModel);
  onChangeRolloffFactor = rolloffFactor => setProperty(this.props.editor, "rolloffFactor", rolloffFactor);
  onChangeRefDistance = refDistance => setProperty(this.props.editor, "refDistance", refDistance);
  onChangeMaxDistance = maxDistance => setProperty(this.props.editor, "maxDistance", maxDistance);
  onChangeConeInnerAngle = coneInnerAngle => setProperty(this.props.editor, "coneInnerAngle", coneInnerAngle);
  onChangeConeOuterAngle = coneOuterAngle => setProperty(this.props.editor, "coneOuterAngle", coneOuterAngle);
  onChangeConeOuterGain = coneOuterGain => setProperty(this.props.editor, "coneOuterGain", coneOuterGain);

  onChangeAudioChannel = audioChannel => setProperty(this.props.editor, "audioChannel", audioChannel);
  onChangeScreenShareMode = screenShareMode => setProperty(this.props.editor, "screenShareMode", screenShareMode);
  onChangeScreenShareMuted = screenShareMuted => setProperty(this.props.editor, "screenShareMuted", screenShareMuted);
  
  handleSession = async (addsession = true) => {
    
    /*
      This script has different behaviours deppending if we are using it
      with the Checkmark that Enables Persistent Sessions or the Button that
      Generates and Removes Sessions.
    */

    // processState: 0 = None, 1 = Removing, 2 = Generating, 3 = Checking
    const processState = addsession ? this.props.node.HBSession ? 1 : 2 : 3;
    this.onProcessSession(processState);

    if (this.props.node.HBPersistent) {
      
      // Force protocol to https
      let url = this.props.node.href;
      url = url.replace(/(http:\/\/|https:\/\/)/g, ""); 
      url = "https://"+url;


      let clearSession = null;
      let response = null;

      /* 
        Checkmark: If session is defined, check if it's still valid
        Button: If session is defined, clear it. If not, create a new one.
      */
      if (this.props.node.HBSession) {
        response = await fetch(fetchfrom+'computer', {
          method: 'POST',
          hide_cursor: true,
          max_area: 1920 * 1080,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profile: {
              "load": this.props.node.HBSession,
            },

            // Close session after 4 seconds, this is just for the initialisation
            timeout: {
              "absolute":  10,
              "inactive":  9,
              "offline":  8,
            },
          })
        });

        if (response) {
          const data = await response.json();

          if (data.session_id) {
            if (processState == 2) {
              console.log("Setting session", data.session_id)
            } else {
              console.log("Session is still valid")
              clearSession = data.session_id;
            }
            
          } else {
            console.log("Session is no longer valid", response);
            // Force the session to be empty
            this.props.editor.setPropertySelected("HBSession", null);
          }
        }
        // If we clicked the button, we just remove this session instead
        if (addsession) {
          addsession = false;
          clearSession = this.props.node.HBSession;
        }
      }

      /*
        Checkmark: Ignore this step
        Button: Create a new session if there is non AND we are NOT removing one
      */
      
      let urlFristSession = null;

      // Request a new persistent Session      
      if (!response && addsession) {
        let responseB = null;
        console.log("There is no session defined")
        responseB = await fetch(fetchfrom+'computer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            start_url: url,
            hide_cursor: true,
            max_area: 1920 * 1080,
            profile: {
              "save": true,
            },

            // Close session after a bit, this is just for the initialisation
            timeout: {
              "absolute":  10,
              "inactive":  9,
              "offline":  8,
            },
          })
        });
      
      
        if (responseB) {
          const data = await responseB.json();

          if (data.session_id) {
            if (processState !== 1) {
              this.props.editor.setPropertySelected("HBSession", data.session_id);
              urlFristSession = data.session_id
            }
            clearSession = data.session_id;
            console.log("clearSession", clearSession);
          } else {
            console.log("Error creating session A", responseB);
            // Force the session to be empty
            this.props.editor.setPropertySelected("HBSession", null);
          }
        }
      }

      /*
        Checkmark: Ignore this step
        Button: Close the session if we made one, this is because we only care for the base session
          to exists in a "saved" state, since it's using {Save: true}, creating a log file
          in the servers that we use to create a new session that will sync data into this base session.
      */
      if (clearSession) {
        // We use clearSession as a query in /stopcomputer
        const responseC = await fetch(fetchfrom+'stopcomputer?session_id='+clearSession, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (responseC) {
          console.log("Session closed", responseC);
        } else {
          console.log("Error closing session", responseC);
        }

        if (!addsession && processState !== 3) {
          this.props.editor.setPropertySelected("HBSession", null);
        }

        // We load this session briefly to set it's url, since start_url doesn't seem to work on creation for some reason
        if (urlFristSession) {
          await fetch(fetchfrom+'computer', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              profile: {
                "save": urlFristSession,
                "load": urlFristSession,
              },
              start_url: url,

              // Close session after 4 seconds, this is just for the initialisation
              timeout: {
                "absolute":  2,
                "inactive":  2,
                "offline":  2,
              },
            })
          }).then(console.log("Session loaded",urlFristSession));

          
        } 
      }
      // kriz note: I cooked some delicious pasta with this code, forgive me
    }

    this.onProcessSession(0);
  }


  /*
    Currently is not supported to clear saved persistent sessions,
    inactive sessions will be cleared automatically after 6 months
    according to direct communication with Hyperbeam developers.
  }*/
  
  // Copy session to clipboard
  copySession = () => {
    if (this.props.node.HBSession) {
      navigator.clipboard.writeText(this.props.node.HBSession);
    }
  }


  render() {
    const node = this.props.node;
    const bandwidth = calculateBandwidth(node.HBRes, node.HBFps, node.HBQlty);
    const bandwidthCategory = getBandwidthCategory(bandwidth);

    return (
      <NodeEditor description={HBElementNodeEditor.description} {...this.props}>

        <PropertyGroup name="Setup">
          <InputGroup name="Screen Share Mode" info="If selected, the Element wil be used to Share the Screen">
            <BooleanInput value={node.screenShareMode} onChange={this.onChangeScreenShareMode}/>
          </InputGroup>

          {node.screenShareMode ?
            (<>
              <InputGroup name="Audio Channel" info="Audio zone from where to get Screen share info">
                <NumericInput value={node.audioChannel} onChange={this.onChangeAudioChannel} precision={1} displayPrecision={1}/>
              </InputGroup>

              <InputGroup name="Disable Audio" info="Disable Audio capture from screen sharing (Enabled audio capture may cause audio loop if users are speaking)">
                <BooleanInput value={node.screenShareMuted} onChange={this.onChangeScreenShareMuted} />
              </InputGroup>
            </>) : (
            <InputGroup name="Url" info="The website that will open by default">
              <StringInput value={node.href} onChange={this.onChangeHref} />
            </InputGroup>)
          }
          
          {node.isYoutubeLink &&
            <InputGroup name="Extract YouTube Embed Video" info="If selected: Extracts the video Embed URL from the Youtube URL and opens it directly, instead of the whole page">
              <BooleanInput value={node.HBForceYoutube} onChange={this.onChangeHBForceYoutube}/>
            </InputGroup>
          }

          {(node.isYoutubeLink && node.HBForceYoutube) && (<>
            <InputGroup name="AutoPlay" info="If selected: The video will start playing automatically">
              <BooleanInput value={node.youtubeAutoPlay} onChange={this.onChangeYoutubeAutoPlay}/>
            </InputGroup>
            <InputGroup name="Activate Captions" info="Please note that this doesn't work with auto-generated Captions, make sure your Captions language is available in the video">
              <BooleanInput value={node.youtubeCC} onChange={this.onChangeYoutubeCC}/>
            </InputGroup>
            <InputGroup disabled={!node.isYoutubeLink || !node.HBForceYoutube || !node.youtubeCC} name="Captions Language">
              <SelectInput options={youtubeCCLangs} value={node.youtubeCCLang} onChange={this.onChangeyoutubeCCLang}/>
            </InputGroup>
            <InputGroup disabled={!node.isYoutubeLink || !node.HBForceYoutube || !node.youtubeCC} name="Other Captions Language" info="If the language you want is not in the list, you can use ISO 639-1 codes here, for example for English: en">
              <StringInput value={node.youtubeCCLangOther} onChange={this.onChangeyoutubeCCLangOther}/>
            </InputGroup>
            <InputGroup name="Play list ID" info="Example: https://youtube.com/playlist?list=PLWuBUsupPv5AyFGMJvXb7eMcgGb1zpCEv&si=yh7ZSpmCn1xum-NW">
              <StringInput value={node.youtubePlaylistID} onChange={this.onChangeYoutubePlaylistID}/>
            </InputGroup>
            <InputGroup name="Loop">
              <BooleanInput value={node.youtubeLoop} onChange={this.onChangeYoutubeLoop}/>
            </InputGroup>
          </>)}
          
          <InputGroup name="Region" info="Region where the Web Browser should be Host">
            <SelectInput options={HBRegionList} value={node.HBRegion} onChange={this.onChangeRegion} />
          </InputGroup>

          <InputGroup name="No user Input" info="If selected, All mouse and keyboard interactions will be ignored">
            <BooleanInput value={node.HBNoCursors} onChange={this.onChangeHBNoCursors}/>
          </InputGroup>
          <InputGroup name="Universal Stream" info="If selected, Users from all Rooms with this Scene will see the same content">
            <BooleanInput value={node.universalStream} onChange={this.onChangeUniversalStream}/>
          </InputGroup>

          <InputGroup name="Persistent session" info="Store session state including bookmarks, history, passwords, and cookies. Inactive sessions will be removed 6 months after last use.">
            <BooleanInput value={node.HBPersistent} onChange={this.onChangeHBPersistent}/>
          </InputGroup>

          <InputGroup disabled={node.processingSession > 0 ? true : node.HBPersistent ? false : true}>
            <Button onClick={this.handleSession}>{
              node.processingSession == 1 ? "Removing session..." :
              node.processingSession == 2 ? "Generating session..." :
              node.processingSession == 3 ? "Checkinig session..." :
              node.HBSession ? "Remove session" : "Generate session"
            }</Button>
          </InputGroup>

          <InputGroup disabled={node.processingSession > 0 ? true : node.HBPersistent ? false : true} name="Session id">
            <span>{node.HBPersistent ? node.HBSession ? node.HBSession : "Session not defined" : "Don't use session"}</span>
            {node.HBSession && <Button onClick={this.copySession} style={{ marginLeft: '10px' }}>Copy</Button>}
          </InputGroup>
        </PropertyGroup>

        <PropertyGroup name="Authorization">
          <InputGroup name="Activate Restrictions" info="User with one of these access can access mouse and keyboard">
            <BooleanInput value={node.HBRestricted} onChange={this.onChangeRestricted}/>
          </InputGroup>
          {(node.HBRestricted) && (<>
            <Collapsible label="Objects">
              <InputGroup name="Spawn emoji" disabled={node.HBRestricted ? false : true}>
                <BooleanInput value={node.HBPermissions["spawn_emoji"] ? true : false} 
                onChange={() => this.onChangePermissions("spawn_emoji")}/>
              </InputGroup>
              <InputGroup name="Spawn/Move Media" disabled={node.HBRestricted ? false : true}>
                <BooleanInput value={node.HBPermissions["spawn_and_move_media"] ? true : false} 
                onChange={() => this.onChangePermissions("spawn_and_move_media")}/>
              </InputGroup>
              <InputGroup name="Pin objects" disabled={node.HBRestricted ? false : true}>
                <BooleanInput value={node.HBPermissions["pin_objects"] ? true : false}
                onChange={() => this.onChangePermissions("pin_objects")}/>
              </InputGroup>
              <InputGroup name="Spawn camera" disabled={node.HBRestricted ? false : true}>
                <BooleanInput value={node.HBPermissions["spawn_camera"] ? true : false}
                onChange={() => this.onChangePermissions("spawn_camera")}/>
              </InputGroup>
              <InputGroup name="Draw Pencil" disabled={node.HBRestricted ? false : true}>
                <BooleanInput value={node.HBPermissions["spawn_drawing"] ? true : false}
                onChange={() => this.onChangePermissions("spawn_drawing")}/>
              </InputGroup>
            </Collapsible>

            <Collapsible label="Moderation">
              <InputGroup name="Mute users" disabled={node.HBRestricted ? false : true}>
                <BooleanInput value={node.HBPermissions["mute_users"] ? true : false}
                onChange={() => this.onChangePermissions("mute_users")}/>
              </InputGroup>
              <InputGroup name="Kick users" disabled={node.HBRestricted ? false : true}>
                <BooleanInput value={node.HBPermissions["kick_users"] ? true : false}
                onChange={() => this.onChangePermissions("kick_users")}/>
              </InputGroup>
              <InputGroup name="Update roles" disabled={node.HBRestricted ? false : true}>
                <BooleanInput value={node.HBPermissions["update_roles"] ? true : false}
                onChange={() => this.onChangePermissions("update_roles")}/>
              </InputGroup>
            </Collapsible>


            <Collapsible label="Hub Management">
              <InputGroup name="Update hub" disabled={node.HBRestricted ? false : true}>
                <BooleanInput value={node.HBPermissions["update_hub"] ? true : false}
                onChange={() => this.onChangePermissions("update_hub")}/>
              </InputGroup>
              <InputGroup name="Update hub promotion" disabled={node.HBRestricted ? false : true}>
                <BooleanInput value={node.HBPermissions["update_hub_promotion"] ? true : false}
                onChange={() => this.onChangePermissions("update_hub_promotion")}/>
              </InputGroup>
              <InputGroup name="Close hub" disabled={node.HBRestricted ? false : true}>
                <BooleanInput value={node.HBPermissions["close_hub"] ? true : false}
                onChange={() => this.onChangePermissions("close_hub")}/>
              </InputGroup>
            </Collapsible>

            <Collapsible label="Misceallaneous">
              <InputGroup name="Fly" disabled={node.HBRestricted ? false : true}>
                <BooleanInput value={node.HBPermissions["fly"] ? true : false}
                onChange={() => this.onChangePermissions("fly")}/>
              </InputGroup>
              <InputGroup name="Change screen" disabled={node.HBRestricted ? false : true}>
                <BooleanInput value={node.HBPermissions["change_screen"] ? true : false}
                onChange={() => this.onChangePermissions("change_screen")}/>
              </InputGroup>
              <InputGroup name="Share screen" disabled={node.HBRestricted ? false : true}>
                <BooleanInput value={node.HBPermissions["share_screen"] ? true : false} 
                onChange={() => this.onChangePermissions("share_screen")}/>
              </InputGroup>
            </Collapsible>
          </>)}

        </PropertyGroup>

        <PropertyGroup name="User interface">
          <InputGroup name="Hide Browser Nav" info="If selected: Hide the browser Navigation Bar">
            <BooleanInput value={node.HBBrowserNav} onChange={this.onChangeHBBrowserNav}/>
          </InputGroup>
          <InputGroup name="Dark mode" info="Set the browser profile to dark mode (Some sites may not support this feature)">
            <BooleanInput value={node.HBDarkMode} onChange={this.onChangeHBDarkMode}/>
          </InputGroup>

          <InputGroup name="Advance Audio Setup">
            <BooleanInput value={node.HBAdvancedAudio} onChange={this.onChangeHBAdvancedAudio}/>
          </InputGroup>     
          {(node.HBAdvancedAudio) && (
            
<>
          <InputGroup name="Audio Type">
            <SelectInput options={AudioTypeOptions} value={node.audioType} onChange={this.onChangeAudioType} />
          </InputGroup>
          <InputGroup name="Volume">
            <CompoundNumericInput value={node.gain} onChange={this.onChangeGain} />
          </InputGroup>
          {node.audioType === AudioTypeList.PannerNode && (
            <>
              <InputGroup
                name="Distance Model"
                info="The algorithim used to calculate audio rolloff."
              >
                <SelectInput
                  options={DistanceModelOptions}
                  value={node.distanceModel}
                  onChange={this.onChangeDistanceModel}
                />
              </InputGroup>

              {node.distanceModel === DistanceModelType.linear ? (
                <InputGroup
                  name="Rolloff Factor"
                  info="A double value describing how quickly the volume is reduced as the source moves away from the listener. 0 to 1"
                >
                  <CompoundNumericInput
                    min={0}
                    max={1}
                    smallStep={0.001}
                    mediumStep={0.01}
                    largeStep={0.1}
                    value={node.rolloffFactor}
                    onChange={this.onChangeRolloffFactor}
                  />
                </InputGroup>
              ) : (
                <NumericInputGroup
                  name="Rolloff Factor"
                  info="A double value describing how quickly the volume is reduced as the source moves away from the listener. 0 to 1"
                  min={0}
                  smallStep={0.1}
                  mediumStep={1}
                  largeStep={10}
                  value={node.rolloffFactor}
                  onChange={this.onChangeRolloffFactor}
                />
              )}
              <NumericInputGroup
                name="Ref Distance"
                info="A double value representing the reference distance for reducing volume as the audio source moves further from the listener."
                min={0}
                smallStep={0.1}
                mediumStep={1}
                largeStep={10}
                value={node.refDistance}
                unit="m"
                onChange={this.onChangeRefDistance}
              />
              <NumericInputGroup
                name="Max Distance"
                info="A double value representing the maximum distance between the audio source and the listener, after which the volume is not reduced any further."
                min={0.00001}
                smallStep={0.1}
                mediumStep={1}
                largeStep={10}
                value={node.maxDistance}
                unit="m"
                onChange={this.onChangeMaxDistance}
              >
                <LocalHide value={node.showAudioSphere} updateVis={this.onChangeShowAudioSphere} />
              </NumericInputGroup>
              <NumericInputGroup
                name="Cone Inner Angle"
                info="A double value describing the angle, in degrees, of a cone inside of which there will be no volume reduction."
                min={0}
                max={360}
                smallStep={0.1}
                mediumStep={1}
                largeStep={10}
                value={node.coneInnerAngle}
                unit="°"
                onChange={this.onChangeConeInnerAngle}
                >
                <LocalHide value={node.showAudioInner} updateVis={this.onChangeShowAudioInner}/>
              </NumericInputGroup>
              <NumericInputGroup
                name="Cone Outer Angle"
                info="A double value describing the angle, in degrees, of a cone outside of which the volume will be reduced by a constant value, defined by the coneOuterGain attribute."
                min={0}
                max={360}
                smallStep={0.1}
                mediumStep={1}
                largeStep={10}
                value={node.coneOuterAngle}
                unit="°"
                onChange={this.onChangeConeOuterAngle}
              >
                <LocalHide value={node.showAudioOuter} updateVis={this.onChangeShowAudioOuter}/>
              </NumericInputGroup>
              <InputGroup
                name="Cone Outer Gain"
                info="A double value describing the amount of volume reduction outside the cone defined by the coneOuterAngle attribute. Its default value is 0, meaning that no sound can be heard."
              >
                <CompoundNumericInput
                  min={0}
                  max={1}
                  step={0.01}
                  value={node.coneOuterGain}
                  onChange={this.onChangeConeOuterGain}
                />
              </InputGroup>

              <SoundCurvePreview
                gain={node.gain}
                distanceModel={node.distanceModel}
                rolloffFactor={node.rolloffFactor}
                refDistance={node.refDistance}
                maxDistance={node.maxDistance}
                coneInnerAngle={node.coneInnerAngle}
                coneOuterAngle={node.coneOuterAngle}
                coneOuterGain={node.coneOuterGain}
                updateAudioSphere={this.onChangeShowAudioSphere}
              />
            </>
          )}
          </>
          )}
        
        {(!node.HBAdvancedAudio) && (
          <>
            <InputGroup name="Falloff Distance" info="Minimum Distance from where the audio will start to fadeout (Full volume if any closer)">
            <NumericInput min={0} max={1000} step={0.5} mediumStep={1} value={node.HBFalloffDistance} onChange={this.onChangeHBFalloffDistance} />
            </InputGroup>
          </>
        )}
        </PropertyGroup>
        
        <PropertyGroup name="Performance">
          <InputGroup name="WebGL" info="Some games and interactive activities require WebGL">
            <BooleanInput value={node.HBWebGL} onChange={this.onChangeHBWebGL}/>
          </InputGroup>
          
          <InputGroup name="Resolution" info="Higher resolutions are are more resource intensive, but are recommended for bigger screens">
            <SelectInput options={HBResList} value={node.HBRes} onChange={this.onChangeHBRes} />
          </InputGroup>
          
          <InputGroup name="FPS" info="24 FPS is recommended for general purposes, as higher values will be more resource intensive">
            <Slider min={24} max={60} step={4} value={node.HBFps} onChange={this.onChangeHBFps} />
            <NumericInput min={24} max={60} step={4} mediumStep={1} value={node.HBFps} onChange={this.onChangeHBFps} />
          </InputGroup>
          
          <InputGroup name="Quality" info="Smooth is recommended for videos and streams, while sharp is better when clarity is needed, like presentations (Warning: Sharp uses 3x more bandwith)">
            <SelectInput options={HBQltyList} value={node.HBQlty} onChange={this.onChangeHBQlty} />
          </InputGroup>

          <InputGroup name="Stready Stream" info="When activated: input lag increases but smoothness is improved and frame drops are reduced (Recommended for videos and streams).">
            <BooleanInput value={node.HBStready} onChange={this.onChangeHBStready}/>
          </InputGroup>
          
          <InputGroup name="AD-Block" info="Adds uBlock to the browser, blocking certain elements (including ads), this may break some sites">
            <BooleanInput value={node.HBuBlock} onChange={this.onChangeHBuBlock}/>
          </InputGroup>

          {bandwidthCategory === 'Too High' && (
            <InputGroup name="Bandwidth" info = "High bandwidth usage may cause lag and stuttering, consider lowering the resolution, fps or quality settings. The total bandwith of all 3D Sreens shouldn't exceed 50 mbps">
              <div style={{ background: '#77000099', color: 'yellow', padding: '0.3em 0.6em', fontSize: '1.15em'}}>
                  ⚠ {bandwidth.toFixed(2)} mbps ({bandwidthCategory})
              </div>
            </InputGroup>
          )}

          {bandwidthCategory !== 'Too High' && (
            <InputGroup name="Bandwidth">
              <div>
                  {bandwidth.toFixed(2)} mbps ({bandwidthCategory})
              </div>
            </InputGroup>
          )}
        </PropertyGroup>


      </NodeEditor>
    );
  }
}
