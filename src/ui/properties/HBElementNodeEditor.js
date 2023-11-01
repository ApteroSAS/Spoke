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
  { label: "Full HD (1080p)", value: 1080 },
]
const HBQltyList = [
  { label: "Smooth", value: "smooth" },
  { label: "Sharp", value: "sharp" },
]

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

  handleSession = async () => {
    return; // Not implemented yet
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

    
    if (this.props.node.HBSession) {
      // clear session
      try {
        fetch(fetchfrom+'stopcomputer?session_id='+this.props.node.HBSession, {
          method: "POST"
        })
        console.log("Clear attempt")
        //this.props.editor.setPropertySelected("HBSession", null);
      } catch (error) {
        console.log("Error deleting session", error);
      } finally {
        this.props.editor.setPropertySelected("HBSession", null);
        console.log("Session deleted");
      }
      
    } else {
      // define session
      let url = this.props.node.href;
      // Force protocol to https
      url.replace(/(http:\/\/|https:\/\/)/g, "");
      url = "https://"+url;

      // Request a new persistent Session      
      const response = await fetch(fetchfrom+'computer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session: null,
          start_url: url,
          region: this.props.node.HBRegion,
          width: this.props.node.HBRes * 16 / 9,
          height: this.props.node.HBRes,
          webgl: this.props.node.HBWebGL,
          kiosk: this.props.node.HBBrowserNav, // Nav bar
          control_disable_default: this.props.node.HBRestricted,
          dark: this.props.node.HBDarkMode,
          fps: this.props.node.HBFps,
          quality: {
            mode: this.props.node.HBQlty
          },
          ublock: this.props.node.HBuBlock,
          profile: {
            "save": true,
          },

          timeout: {
            "absolute":  12 * 60 * 60, //seconds
            "inactive":  60, //seconds
            "offline":  40, //seconds
          },
        })
      });

      if (response) {
        const data = await response.json();
        console.log("data", data);

        if (data.session_id) {
          this.props.editor.setPropertySelected("HBSession", data.session_id);
        } else {
          console.log("Error creating session A", response);
          // Force the session to be empty
          this.props.editor.setPropertySelected("HBSession", null);
        }
      }

    }
    
  }

  copySession = () => {
    return; // Not implemented yet
    if (this.props.node.HBSession) {
      navigator.clipboard.writeText(this.props.node.HBSession);
    }
  }

  

  render() {
    const node = this.props.node;

    return (
      <NodeEditor description={HBElementNodeEditor.description} {...this.props}>

        <PropertyGroup name="Setup">
          <InputGroup name="Url" info="The website that will open by default">
            <StringInput value={node.href} onChange={this.onChangeHref} />
          </InputGroup>
          
          <DInputGroup disabled={true} name="Persistent (Optional)" info="Store session state including bookmarks, history, passwords, and cookies" >
            <DButton onClick={this.handleSession}>{node.HBSession ? "Delete session" : "Generate session"}</DButton>
          </DInputGroup>
          <DInputGroup disabled={true} name="Session id">
            <span style={{display:"none"}}>{node.HBSession ? node.HBSession : "Clear on Exit"}</span>
            {node.HBSession && <DButton onClick={this.copySession} style={{ marginLeft: '10px' }}>Copy</DButton>}
          </DInputGroup>
          
          
          <InputGroup name="Region" info="Region where the Web Browser should be Host">
            <SelectInput options={HBRegionList} value={node.HBRegion} onChange={this.onChangeRegion} />
          </InputGroup>

          <DInputGroup disabled={true} name="Restricted Control" info="If true, users cannot control the browser by default, and need to be manually granted access by an admin user">
            <BooleanInput value={node.HBRestricted} onChange={this.onChangeHBRestricted}/>
          </DInputGroup>

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
          
          <InputGroup name="Quality" info="Smooth is recommended when ">
            <SelectInput options={HBQltyList} value={node.HBQlty} onChange={this.onChangeHBQlty} />
          </InputGroup>
          
          <InputGroup name="AD-Block" info="Adds uBlock to the browser, blocking certain elements (including ads), this may break some sites">
            <BooleanInput value={node.HBuBlock} onChange={this.onChangeHBuBlock}/>
          </InputGroup>
        </PropertyGroup>


      </NodeEditor>
    );
  }
}
