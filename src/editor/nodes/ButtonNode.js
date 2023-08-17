import EditorNodeMixin from "./EditorNodeMixin";
import { getObjectPerfIssues, maybeAddLargeFileIssue } from "../utils/performance";
import { GLTFLoader } from "../gltf/GLTFLoader";
import spawnPointModelUrl from "../../assets/spawn-point.glb";
import boutonCubeBleuUrl from "../../assets/bouton_cube_bleu.glb";
import { BoxBufferGeometry, Euler, Geometry, Mesh, MeshBasicMaterial, Object3D } from "three";

let ButtonHelperModel = null;
/*
const Trigger = {
  type: "btn-ask" | "btn",
  text: string | null,
  style: "rounded-button" | "rounded-text-action-button" | "rounded-action-button" | "rounded-text-button" | null,
  "authorization.permission": string | null,
  "authorization.email": string | null
};

const spawn_attachAction = {
  url: string,
  mediaFrame: string,
  attributes: string | null
};

const spawnAction = {
  url: string
};

const animationAction = {
  data: string//name of animation
};

const urlAction = {
  url: string,
  mode: "rest_get" | "rest_post" | "change" | null,//null = new tab
  data: any,//data to send
  config: any//config for axios
};

const sidebar_iframeAction = {
  url: string,
  title: string | null
};

const Config = {
  btnType: Trigger.type,
  btnText: Trigger.text,
  btnStyle: Trigger.style,
  btnAuthorizationPermission: Trigger["authorization.permission"],
  btnAuthorizationEmail: Trigger["authorization.email"],
  mode: "Spawn" | "Animation" | "Link",
  SubMode: "Attach" | "API" | "Sidebar" | "Redirection" | "NewTab" | null,
  actUrl: spawn_attachAction.url | spawnAction.url | animationAction.data | urlAction.url,
  actMediaFrame: spawn_attachAction.mediaFrame,
  actAttributes: spawn_attachAction.attributes,
  actData: urlAction.data,
  actConfig: urlAction.config,
  actTitle: sidebar_iframeAction.title,
  actMode: urlAction.mode
};/**/
const defaultConfig = {
  btnType: "btn",
  btnText: "OpenSea 2",
  btnStyle: "rounded-text-action-button",
  mode: "Link",
  subMode: "Sidebar",
  actUrl: "https://meet.aptero.co/service/static/opensea-viewer/index.html?url=https%3A%2F%2Fopensea.io%2Fassets%2Fethereum%2F0x5cc5b05a8a13e3fbdb0bb9fccd98d38e50f90c38%2F1914",
  actTitle: "Art & Festif"
};


export default class ButtonNode extends EditorNodeMixin(Object3D) {
  static componentName = "button";

  static nodeName = "Button";

  static subtype = "aptero";

  //TODO : customize the config through the ButtonNodeEditor
  //Please use compileButtonConfigToUserData as a reference
  //config = {};
  //config = {...defaultConfig};
  config = 
  {
    btnType: "btn"
  };

  //write get and set for each config property
  get btnType() {
    return this.config.btnType;
  }
  set btnType(value) {
    this.config.btnType = value;
  }
  get btnText() {
    return this.config.btnText;
  }
  set btnText(value) {
    this.config.btnText = value;
  }
  get btnStyle() {
    return this.config.btnStyle;
  }
  set btnStyle(value) {
    this.config.btnStyle = value;
  }
  get btnAuthorizationPermission() {
    return this.config.btnAuthorizationPermission;
  }
  set btnAuthorizationPermission(value) {
    this.config.btnAuthorizationPermission = value;
  }
  get btnAuthorizationEmail() {
    return this.config.btnAuthorizationEmail;
  }
  set btnAuthorizationEmail(value) {
    this.config.btnAuthorizationEmail = value;
  }
  get mode() {

    return this.config.mode;
  }
  set mode(value) {
    console.log(value)
    if(value == "spawn" && this.subMode!="attach" && this.subMode!=null){
      this.subMode = null
    }
    if(value == "Link" && this.subMode!="API" && this.subMode!="Redirection"  && this.subMode!="Sidebar" && this.subMode!=null){
      this.subMode = null
    }
    this.config.mode = value;
  }
  get subMode() {
    return this.config.subMode;
  }
  set subMode(value) {
    this.config.subMode = value;
  }
  get actUrl() {
    return this.config.actUrl;
  }
  set actUrl(value) {
    this.config.actUrl = value;
  }
  get actMediaFrame() {
    return this.config.actMediaFrame;
  }
  set actMediaFrame(value) {
    this.config.actMediaFrame = value;
  }
  get actAttributes() {
    return this.config.actAttributes;
  }
  set actAttributes(value) {
    this.config.actAttributes = value;
  }
  get actData() {
    return this.config.actData;
  }
  set actData(value) {
    this.config.actData = value;
  }
  get actConfig() {
    return this.config.actConfig;
  }
  set actConfig(value) {
    this.config.actConfig = value;
  }
  get actTitle() {
    return this.config.actTitle;
  }
  set actTitle(value) {
    this.config.actTitle = value;
  }
  get actMode() {
    return this.config.actMode;
  }
  set actMode(value) {
    this.config.actMode = value;
  }


  static async load() {
    const { scene } = await new GLTFLoader(boutonCubeBleuUrl).loadGLTF();

    scene.traverse(child => {
      if (child.isMesh) {
        child.layers.set(1);
      }
    });

    scene.rotation.set(Math.PI / 2, 0, 0);

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
    this.rotation.toVector3();
    let StringifiedAction = {};
    const p = this.position,
      r = this.rotation.toVector3();
    let StringifiedTrigger = {
      type: 'btn',
      text: this.btnText,
      style: this.btnStyle,
      position: { x: 0, y: 0, z: 0 }, // position: {x:p.x,y:-p.z,z:p.y},
      rotation: { x: 0, y: 0, z: 0 },
      size: 1,
      "authorization.permission": this.btnAuthorizationPermission,
      "authorization.email": this.btnAuthorizationEmail
    };

    switch (this.mode) {
      case "Spawn":
        switch (this.subMode) {
          case "Attach":
            //create spawn_attachAction
            StringifiedAction = {
              type: "spawn_attach",
              url: this.actUrl,
              mediaFrame: this.actMediaFrame,
              attributes: this.actAttributes
            };
            break;
          default:
            //create spawnAction
            StringifiedAction = {
              type: "spawn",
              url: this.actUrl
            };
            break;
        }
        break;
      case "Animation":
        //create animationAction
        StringifiedAction = {
          type: "animation",
          data: this.actData
        };
        break;
      case "Link":
        switch (this.subMode) {
          case "API":
            //create urlAction with mode = rest_get or rest_post
            StringifiedAction = {
              type: "url",
              url: this.actUrl,
              mode: this.actMode,
              data: this.actData,
              config: this.actConfig
            };
            break;
          case "Sidebar":
            //create sidebar_iframeAction
            StringifiedAction = {
              type: "sidebar_iframe",
              url: this.actUrl,
              title: this.actTitle
            };
            break;
          case "Redirection":
            //create urlAction with mode = change
            StringifiedAction = {
              type: "url",
              url: this.actUrl,
              mode: 'change'
            };
            break;
          default:
            //create urlAction with mode = null
            StringifiedAction = {
              type: "url",
              url: this.actUrl,
              mode: null
            };
            break;
        }
    }
    console.log("Stringifying...");
    console.log(StringifiedAction, StringifiedTrigger);
    this.setUserData({
      "apt.action.controller.btn1": JSON.stringify([
        {
          actions: [StringifiedAction],
          triggers: [StringifiedTrigger]
        }
      ]),
      "apt.limit.png": 1,
      prop: 1
    });
  }
  setUserData(userData) {
    for (const key in userData) {
      this.userData[key] = userData[key];
    }
    this.addGLTFComponent("shadow", { cast: false, receive: false });
  }
  copy(source, recursive = true) {
    if (recursive) {
      this.remove(this.helper);
    }

    super.copy(source, recursive);

    //Copy config on the copied object
    this.config = {...source.config};

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
    console.log("Saving config...");

    this.compileButtonConfigToUserData(this.config);

    //this.config.style = this.btnStyle; //TEST
    
    console.log("Config saved!");
    console.log(this.config);
    console.log("--------------------");

    return super.serialize({
      [ButtonNode.componentName]: {
        config: JSON.stringify(this.config)
      }
    });

  }
  static async deserialize(editor, json) {

    const node = await super.deserialize(editor, json);

    //super.deserialize(editor, json);
    //node.config = JSON.parse(json[ButtonNode.componentName].config);
    
    //node.btnStyle = "rounded-text-action-button";
    console.log(JSON.stringify(json))

    console.log("Searching for: "+ButtonNode.componentName);

    const { config } = json.components.find(c => c.name === ButtonNode.componentName).props;

    console.log("Check config: "+config);

    /*if (json[ButtonNode.componentName])
    {
      console.log("Component found!");

      if (json[ButtonNode.componentName].config)
      {console.log("Config component found!");}
      else
      {console.log("No config component found!");}
    }
    else
    {console.log("No json component found!");}*/
    
    /*if (json[ButtonNode.componentName] && json[ButtonNode.componentName].config) {
      node.config = JSON.parse(json[ButtonNode.componentName].config);
      console.log("-->Config found!");
    }
    else
    {
      console.log("-->No config found!");
    }*/

    node.config = JSON.parse(config);

    //this.compileButtonConfigToUserData(this.config);
    return node;
  }
  
  prepareForExport() {
    super.prepareForExport();

    //SetUserData for export (not for the editor)
    this.compileButtonConfigToUserData(this.config);
    super.serialize({ [ButtonNode.componentName]: { config: JSON.stringify(this.config) } });
    
    this.remove(this.helper);
  }
  /*
  //btnType
  prepareForExport() {
    this.remove(this.helper);
    return super.prepareForExport();
  }*/

}
