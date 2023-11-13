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
import { Button } from "../inputs/Button";
import styled from "styled-components";

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
  if (bandwidth <= 5) {
      return 'Low';
  } else if (bandwidth <= 10) {
      return 'Mid';
  } else if (bandwidth <= 17.5) {
      return 'High';
  } else {
      return 'Too High';
  }
}


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
  };
  onChangeRegion = HBRegion => {
    this.props.editor.setPropertySelected("HBRegion", HBRegion);
  };
  onChangeHBRestricted = HBRestricted => {
    this.props.editor.setPropertySelected("HBRestricted", HBRestricted);
  };
  onChangeHBBrowserNav = HBBrowserNav => {
    this.props.editor.setPropertySelected("HBBrowserNav", HBBrowserNav);
  };
  onChangeHBDarkMode = HBDarkMode => {
    this.props.editor.setPropertySelected("HBDarkMode", HBDarkMode);
  };
  onChangeHBWebGL = HBWebGL => {
    this.props.editor.setPropertySelected("HBWebGL", HBWebGL);
  };
  onChangeHBRes = HBRes => {
    this.props.editor.setPropertySelected("HBRes", HBRes);
  };
  onChangeHBFps = HBFps => {
    this.props.editor.setPropertySelected("HBFps", HBFps);
  };
  onChangeHBQlty = HBQlty => {
    this.props.editor.setPropertySelected("HBQlty", HBQlty);
  };
  onChangeHBuBlock = HBuBlock => {
    this.props.editor.setPropertySelected("HBuBlock", HBuBlock);
  }
  onChangeHBNoCursors = HBNoCursors => {
    this.props.editor.setPropertySelected("HBNoCursors", HBNoCursors);
  }
  onChangeHBPersistent = async HBPersistent => {
    this.props.editor.setPropertySelected("HBPersistent", HBPersistent);

    // Check if session is still valid if defined
    if (this.props.node.HBSession && HBPersistent) { // Redundant, but it saves some processing
      this.handleSession(false);
    }
  }

  onProcessSession = processingSession => {
    this.props.editor.setPropertySelected("processingSession", processingSession);
  }
  

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

      console.log("SET URL", url);

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
          console.log("data", data);

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
          console.log("data", data);

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
          <InputGroup name="Url" info="The website that will open by default">
            <StringInput value={node.href} onChange={this.onChangeHref} />
          </InputGroup>
          
          <InputGroup name="Region" info="Region where the Web Browser should be Host">
            <SelectInput options={HBRegionList} value={node.HBRegion} onChange={this.onChangeRegion} />
          </InputGroup>

          <InputGroup name="No Cursors" info="If selected, All mouse interactions will be ignored">
            <BooleanInput value={node.HBNoCursors} onChange={this.onChangeHBNoCursors}/>
          </InputGroup>

          <DInputGroup disabled={true} name="Restricted Control" info="If selected, users cannot control the browser by default, and need to be manually granted access by an admin user">
            <BooleanInput value={node.HBRestricted} onChange={this.onChangeHBRestricted}/>
          </DInputGroup>


          <InputGroup name="Persistent (Optional)" info="Store session state including bookmarks, history, passwords, and cookies. Inactive sessions will be removed 6 months after last use.">
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

        <PropertyGroup name="User interface">
          <InputGroup name="Hide Browser Nav" info="If selected: Hide the browser Navigation Bar">
            <BooleanInput value={node.HBBrowserNav} onChange={this.onChangeHBBrowserNav}/>
          </InputGroup>

          <InputGroup name="Dark mode" info="Set the browser profile to dark mode (Some sites may not support this feature)">
            <BooleanInput value={node.HBDarkMode} onChange={this.onChangeHBDarkMode}/>
          </InputGroup>
        </PropertyGroup>
        
        <PropertyGroup name="Performance">
          <InputGroup name="WebGL" info="Some games and interactive activities require WebGL">
            <BooleanInput value={node.HBWebGL} onChange={this.onChangeHBWebGL}/>
          </InputGroup>
          
          <InputGroup name="Resolution" info="Higher resolutions are are more resource intensive, but are recommended for bigger screens">
            <SelectInput options={HBResList} value={node.HBRes} onChange={this.onChangeHBRes} />
          </InputGroup>
          
          <InputGroup name="FPS" info="24 FPS is recommended for general purposes, as higher values will be more resource intensive">
            <Slider min={12} max={60} step={4} value={node.HBFps} onChange={this.onChangeHBFps} />
            <NumericInput min={12} max={60} step={4} mediumStep={1} value={node.HBFps} onChange={this.onChangeHBFps} />
          </InputGroup>
          
          <InputGroup name="Quality" info="Smooth is recommended for videos and streams, while sharp is better when clarity is needed, like presentations (Warning: Sharp uses 3x more bandwith)">
            <SelectInput options={HBQltyList} value={node.HBQlty} onChange={this.onChangeHBQlty} />
          </InputGroup>
          
          <InputGroup name="AD-Block" info="Adds uBlock to the browser, blocking certain elements (including ads), this may break some sites">
            <BooleanInput value={node.HBuBlock} onChange={this.onChangeHBuBlock}/>
          </InputGroup>

          {bandwidthCategory === 'Too High' && (
            <InputGroup name="Bandwidth" info = "High bandwidth usage may cause lag and stuttering, consider lowering the resolution, fps or quality settings">
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
