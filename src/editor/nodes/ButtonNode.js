import EditorNodeMixin from "./EditorNodeMixin";
import { getObjectPerfIssues, maybeAddLargeFileIssue } from "../utils/performance";
import { GLTFLoader } from "../gltf/GLTFLoader";
import spawnPointModelUrl from "../../assets/spawn-point.glb";
import { BoxBufferGeometry, Euler, Geometry, Mesh, MeshBasicMaterial, Object3D } from "three";

let ButtonHelperModel = null;
/*
const Trigger = {
  type : "btn-ask"|"btn",
  text : string|null,
  style : "rounded-button" | "rounded-text-action-button" | "rounded-action-button" | "rounded-text-button"|null,
  "authorization.permission" : string|null,
  "authorization.email" : string|null,
}
const spawn_attachAction = {
  url: string,
  mediaFrame: string,
  attributes:string|null
}
const spawnAction = {
  url: string
}
const animationAction = {
  data:string//name of animation
}
const urlAction = {
  url:string,
  mode:"rest_get"|"rest_post"|"change"|null,//null = new tab
  data:any,//data to send
  config:any//config for axios
}
const sidebar_iframeAction = {
  url:string,
  title:string|null,
}
const Config = {
  btnType : Trigger.type,
  btnText : Trigger.text,
  btnStyle : Trigger.style,
  btnAuthorizationPermission : Trigger["authorization.permission"],
  btnAuthorizationEmail : Trigger["authorization.email"],
  mode : "Spawn"|"Animation"|"Link",
  SubMode : "Attach"|"API"|"Sidebar"|"Redirection"|"NewTab"|null,
  actUrl: spawn_attachAction.url|spawnAction.url|animationAction.data|urlAction.url,
  actMediaFrame: spawn_attachAction.mediaFrame,
  actAttributes: spawn_attachAction.attributes,
  actData: urlAction.data,
  actConfig: urlAction.config,
  actTitle: sidebar_iframeAction.title,
  actMode: urlAction.mode
}*/
const defaultConfig = {
  btnType : "btn",
    btnText : "OpenSea 2",
  btnStyle : "rounded-text-action-button",
  mode: "Link",
  subMode: "Sidebar",
  actUrl: "https://meet.aptero.co/service/static/opensea-viewer/index.html?url=https%3A%2F%2Fopensea.io%2Fassets%2Fethereum%2F0x5cc5b05a8a13e3fbdb0bb9fccd98d38e50f90c38%2F1914",
  actTitle: "Art & Festif",
}


export default class ButtonNode extends EditorNodeMixin(Object3D) {
  static componentName = "button";

  static nodeName = "Button";

  static subtype = "aptero";

  //TODO : customize the config through the ButtonNodeEditor
  //Please use compileButtonConfigToUserData as a reference
  config = defaultConfig;

  static async load() {
    const { scene } = await new GLTFLoader(spawnPointModelUrl).loadGLTF();

    scene.traverse(child => {
      if (child.isMesh) {
        child.layers.set(1);
      }
    });

    ButtonHelperModel = scene;
  }

  constructor(editor) {
    super(editor, new BoxBufferGeometry(), new MeshBasicMaterial());

    if (ButtonHelperModel) {
      this.helper = ButtonHelperModel.clone();
      this.add(this.helper);
    } else {
      console.warn("SpawnPointNode: helper model was not loaded before creating a new SpawnPointNode");
      this.helper = null;
    }
  }

  compileButtonConfigToUserData(config) {
    this.rotation.toVector3()
    let StringifiedAction = {}
    const p = this.position, r = this.rotation.toVector3();
    let StringifiedTrigger = {
      type: config.btnType,
      text: config.btnText,
      style: config.btnStyle,
      position: {x:0,y:0,z:0},// position: {x:p.x,y:-p.z,z:p.y},
      rotation: {x:0,y:0,z:0},
      size: 1,
      "authorization.permission": config.btnAuthorizationPermission,
      "authorization.email": config.btnAuthorizationEmail
    }

    switch (config.mode) {
      case "Spawn":
        switch (config.subMode) {
          case "Attach":
            //create spawn_attachAction
            StringifiedAction = {
              type : "spawn_attach",
              url : config.actUrl,
              mediaFrame : config.actMediaFrame,
              attributes : config.actAttributes
            };
            break;
          default:
            //create spawnAction
            StringifiedAction = {
              type : "spawn",
              url : config.actUrl
            }
            break;
        }
        break;
      case "Animation":
        //create animationAction
        StringifiedAction = {
          type : "animation",
          data : config.actData
        }
        break;
      case "Link":
        switch (config.subMode) {
          case "API":
            //create urlAction with mode = rest_get or rest_post
            StringifiedAction = {
              type : "url",
              url : config.actUrl,
              mode : config.actMode,
              data : config.actData,
              config : config.actConfig
            }
            break;
          case "Sidebar":
            //create sidebar_iframeAction
            StringifiedAction = {
              type : "sidebar_iframe",
              url : config.actUrl,
              title : config.actTitle
            }
            break;
          case "Redirection":
            //create urlAction with mode = change
            StringifiedAction = {
              type : "url",
              url : config.actUrl,
              mode : config.actMode,
            }
            break;
          case "NewTab":
            //create urlAction with mode = null
            StringifiedAction = {
              type : "url",
              url : config.actUrl,
              mode : config.actMode,
            }
            break;
          default:
            //create urlAction with mode = null
            StringifiedAction = {
              type : "url",
              url : config.actUrl,
              mode : config.actMode,
            }
            break;
        }
    }
    console.log(StringifiedAction, StringifiedTrigger);
    this.setUserData({
      "apt.action.controller.btn1" : JSON.stringify([{
        actions : [StringifiedAction],
        triggers : [StringifiedTrigger]
      }]),
      "apt.limit.png" : 1,
      "prop" : 1
    })
  }

  setUserData(userData) {
    for (const key in userData) {
      this.userData[key] = userData[key];
    }
    this.addGLTFComponent("shadow",{cast:false,receive:false});
  }

  copy(source, recursive = true) {
    if (recursive) {
      this.remove(this.helper);
    }
    
    super.copy(source, recursive);

    /*this.controls = source.controls;
    this.billboard = source.billboard;
    this.alphaMode = source.alphaMode;
    this.alphaCutoff = source.alphaCutoff;
    this._canonicalUrl = source._canonicalUrl;
    this.href = source.href;*/

    if (recursive) {
      const helperIndex = source.children.findIndex(child => child === source.helper);
      if (helperIndex !== -1) {
        this.helper = this.children[helperIndex];
      }
    }
    return this;
  }

  serialize() {
    //setUserData
    this.compileButtonConfigToUserData(this.config);
    return super.serialize({
      [ButtonNode.componentName]: {
        config: JSON.stringify(this.config)
      }
    });
  }

  deserialize(editor, json) {
    console.dir(editor, json);
    super.deserialize(editor, json);
    this.config = JSON.parse(json[ButtonNode.componentName].config);
    //this.compileButtonConfigToUserData(this.config);
    return this;
  }

  prepareForExport() {
    super.prepareForExport();
    //setUserData
    this.remove(this.helper);
  }
  
}
