import EditorNodeMixin from "./EditorNodeMixin";
import { getObjectPerfIssues, maybeAddLargeFileIssue } from "../utils/performance";
import { GLTFLoader } from "../gltf/GLTFLoader";
import spawnPointModelUrl from "../../assets/spawn-point.glb";
import gptButtonModel from "../../assets/apteroelements/chatgpt_button.glb";
import { BoxBufferGeometry, Euler, Geometry, Mesh, MeshBasicMaterial, Object3D, Color } from "three";
import serializeColor from "../utils/serializeColor";
import { isString } from "markdown-it/lib/common/utils";

let ButtonHelperModel = null;

const defaultConfig = {
  btnType: "btn",
  btnText: "ChatGPT",
  btnStyle: "rounded-text-action-button",
  mode: "Link",
  subMode: "Sidebar",
  actUrl: "",//"https://meet.aptero.co/service/chatgpt/",
  actTitle: "Aptero ChatGPT"
};


export default class ButtonNodeGPT extends EditorNodeMixin(Object3D) {
  static componentName = "gptbutton";

  static nodeName = "AI ChatBot Button";

  static subtype = "aptero";

  config = 
  {
    ...defaultConfig
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

  //ChatGPT specific config

  get gptModel() {
    return this.config.gptModel;
  }
  set gptModel(value) {
    this.config.gptModel = value;
  }
  get gptIgnorecache() {
    return this.config.gptIgnorecache;
  }
  set gptIgnorecache(value) {
    this.config.gptIgnorecache = value;
  }
  get gptIntro() {
    return this.config.gptIntro;
  }
  set gptIntro(value) {
    this.config.gptIntro = value;
  }
  get gptSticky() {
    return this.config.gptSticky;
  }
  set gptSticky(value) {
    this.config.gptSticky = value;
  }
  get gptCustomImg() {
    return this.config.gptCustomImg;
  }
  set gptCustomImg(value) {
    this.config.gptCustomImg = value;
  }
  get gptCustomImgRound() {
    return this.config.gptCustomImgRound;
  }
  set gptCustomImgRound(value) {
    this.config.gptCustomImgRound = value;
  }
  get gptCustomGreetings() {
    return this.config.gptCustomGreetings;
  }
  set gptCustomGreetings(value) {
    this.config.gptCustomGreetings = value;
  }
  get gptCustomColor() {
    return this.config.gptCustomColor;
  }
  set gptCustomColor(value) {
    this.config.gptCustomColor = value;
  }
  get gptCustomDescription() {
    return this.config.gptCustomDescription;
  }
  set gptCustomDescription(value) {
    this.config.gptCustomDescription = value;
  }
  get gptCustomBackground() {
    return this.config.gptCustomBackground;
  }
  set gptCustomBackground(value) {
    this.config.gptCustomBackground = value;
  }
  get gptCustomIconUser() {
    return this.config.gptCustomIconUser;
  }
  set gptCustomIconUser(value) {
    this.config.gptCustomIconUser = value;
  }
  get gptCustomIconAssistant() {
    return this.config.gptCustomIconAssistant;
  }
  set gptCustomIconAssistant(value) {
    this.config.gptCustomIconAssistant = value;
  }


  static async load() {
    const { scene } = await new GLTFLoader(gptButtonModel).loadGLTF();

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

    //Set default config
    this.gptCustomColor = new Color(0xf26543);
    this.gptCustomBackground = "";
    this.gptCustomIconUser = "";
    this.gptCustomIconAssistant = "";
    this.gptCustomGreetings = "Hello ! I'm [Aptero]'s AI";
    this.gptCustomDescription = "";
    this.gptCustomImg = "";
    this.gptCustomImgRound = 0;
    this.gptIntro = "Hi, I'm Aptero's AI assistant. How can I help you today?";
    this.gptIgnorecache = true;
    this.gptSticky = true;
    this.gptModel = "gpt-3.5-turbo";
    this.btnType = "btn";
    this.btnText = "ChatGPT";
    this.btnStyle = "rounded-text-action-button";
    this.btnAuthorizationPermission = "";
    this.btnAuthorizationEmail = "";
    this.mode = "Link";
    this.subMode = "Sidebar";
    this.actUrl = "";
    this.actTitle = "Aptero ChatGPT";
    this.actMediaFrame = "";
    this.actAttributes = "";
    this.actData = "";
    this.actConfig = "";
    this.actMode = "rest_get";
    
    
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
    
    //const urlbase = "https://meet.aptero.co/service/chatgpt/";
    const urlbase = "http://localhost:3000/service/chatgpt/"; //Local

    var urlprompts = "";
    
    //Add parameters to urlprompts in a clean way!
    function addParam(param, value) {
      if (value != "" && value != null)
      {
        //Convert unsafe characters into codes (We don't want to break the url!)
        let valueclean = value;
        if (isString(value))
        {valueclean = encodeURIComponent(value);}
        
        //Decide if we need to add a & or a ? to the urlprompts
        if (urlprompts != "") {
          urlprompts += "&";
        }
        else
        {urlprompts+="?";}
        //Add the parameter to the urlprompts
        urlprompts += param+"="+valueclean;
      }
    }
    
    const colorval = String(serializeColor(this.gptCustomColor));

    addParam("prompt", this.actUrl);
    addParam("model", this.gptModel);
    addParam("ignorecache", this.gptIgnorecache);
    addParam("intro", this.gptIntro);
    addParam("sticky", this.gptSticky);
    addParam("customImg", this.gptCustomImg);
    addParam("customImgRound", this.gptCustomImgRound);
    addParam("customGreetings", this.gptCustomGreetings);
    addParam("customColor", colorval);
    addParam("customDescription", this.gptCustomDescription);
    addParam("customBackground", this.gptCustomBackground);
    addParam("customIconUser", this.gptCustomIconUser);
    addParam("customIconAssistant", this.gptCustomIconAssistant);

    console.log("urlprompts: "+urlprompts)
    console.log("encryptedUrlprompts: "+encryptedUrlprompts)

    StringifiedAction = {
      type: "sidebar_iframe",
      url: urlbase+urlprompts,
      //url: urlbase+"?encryptedParams="+encryptedUrlprompts, //For next version
      title: this.actTitle
    };
    
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
      [ButtonNodeGPT.componentName]: {
        config: JSON.stringify(this.config)
      }
    });

  }
  static async deserialize(editor, json) {

    const node = await super.deserialize(editor, json);

    //super.deserialize(editor, json);
    //node.config = JSON.parse(json[ButtonNodeGPT.componentName].config);
    //node.btnStyle = "rounded-text-action-button";
    console.log(JSON.stringify(json))
    console.log("Searching for: "+ButtonNodeGPT.componentName);

    const { config } = json.components.find(c => c.name === ButtonNodeGPT.componentName).props;
    
    //We get the custom color value from the config

    console.log("Check config: "+config);
    node.config = JSON.parse(config);

    //We need to convert the color from the config back to a THREE.Color
    node.gptCustomColor = new Color(node.gptCustomColor);

    return node;
  }
  
  prepareForExport() {
    super.prepareForExport();

    //SetUserData for export (not for the editor)
    this.compileButtonConfigToUserData(this.config);
    super.serialize({ [ButtonNodeGPT.componentName]: { config: JSON.stringify(this.config) } });
    
    this.remove(this.helper);
  }

}
