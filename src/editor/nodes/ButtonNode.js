import EditorNodeMixin from "./EditorNodeMixin";
import { getObjectPerfIssues, maybeAddLargeFileIssue } from "../utils/performance";
import { GLTFLoader } from "../gltf/GLTFLoader";
import spawnPointModelUrl from "../../assets/spawn-point.glb";
import boutonCubeBleuUrl from "../../assets/bouton_cube_bleu.glb";
import boutonCubeWideBleuUrl from "../../assets/bouton_cube_wide_bleu.glb";
import { BoxBufferGeometry, Euler, Geometry, Mesh, MeshBasicMaterial, Object3D } from "three";

let ButtonHelperModel = null;
let ButtonHelperModelWide = null;


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
    btnType: "btn",
    actions: []
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
    this.updateHelperModel();
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


  get apteroActions() {  
    // Clone the actions array to avoid modifying the original array
    const actionsCopy = [];
    this.config.actions.forEach(action => {
      actionsCopy.push({ ...action });
    });

    return [-1, actionsCopy];
  }
  set apteroActions(value) {
    const index = value[0];
    
    if (index === -3) {
      // Remove action
      const removeIndex = value[1].index;
      this.config.actions.splice(removeIndex, 1);
    } else if (index === -2) {
      // Add action
      const newAction = {
        mode: 'spawn', // default mode, adjust based on your needs
        subMode: null,
        actUrl: '',
        actMediaFrame: '',
        actAttributes: {},
        actData: '',
        actConfig: '',
        actReclick: 0,
        actTitle: '',
        actMode: '',
        actLoop: false,
        actRepeat: 1,
        actSpeed: 1
      };

      this.config.actions.push(newAction);
    } else if (index === -1) {
      // Undo action (Restore whole actions array)
      const actionList = value[1]; //FULL ARRAY
      this.config.actions = [ ...actionList ];
    } else {
      // Set action
      const actions = value[1];
      this.config.actions[index] = { ...this.config.actions[index], ...actions };
    }
  }

  static async load() {
    // Load regular button model

    const regularModel = await new GLTFLoader(boutonCubeBleuUrl).loadGLTF();
    regularModel.scene.traverse(child => {
      if (child.isMesh) {
        child.layers.set(1);
      }
    });
    regularModel.scene.rotation.set(Math.PI / 2, 0, 0);
    ButtonHelperModel = regularModel.scene;


    // Load wide button model
    const wideModel = await new GLTFLoader(boutonCubeWideBleuUrl).loadGLTF();
    wideModel.scene.traverse(child => {
      if (child.isMesh) {
        child.layers.set(1);
      }
    });
    wideModel.scene.rotation.set(Math.PI / 2, 0, 0);
    ButtonHelperModelWide = wideModel.scene;
  }

  constructor(editor) {
    super(editor, new BoxBufferGeometry(), new MeshBasicMaterial());

    this.config = this.config || {};
    this.config.actions = this.config.actions || [];

    this.updateHelperModel(); // Call this method to set the initial helper model
    //Update model the next tick too, to ensure the model is loaded
    setTimeout(() => {
      this.updateHelperModel();
    }, 0);
  }
  updateHelperModel() {
    // Ensure models are loaded
    if (!ButtonHelperModel || !ButtonHelperModelWide) {
      console.warn("Button models are not loaded yet.");
      return;
    }

    // Remove existing helper if any
    if (this.helper) {
      this.remove(this.helper);
    }

    // Select and clone the appropriate model based on btnStyle
    if (this.btnStyle === "rounded-text-action-button" || this.btnStyle === "rounded-text-button") {
      this.helper = ButtonHelperModelWide.clone();
    } else {
      this.helper = ButtonHelperModel.clone();
    }

    // Add the selected helper model to the node
    this.add(this.helper);

    // Update the helper model so the Shadow is properly updated
    this.helper.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.updateMatrix();
      }
    });
  }
  compileButtonConfigToUserData(config) {
    this.rotation.toVector3();
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
  
    let StringifiedActions = this.config.actions.map(action => {
      let actionDetails = {};
      switch (action.mode) {
        case "Spawn":
        case "spawn":
          if (action.subMode === "Attach" || action.subMode === "attach") {
            actionDetails = {
              type: "spawn_attach",
              url: action.actUrl,
              mediaFrame: action.actMediaFrame,
              attributes: action.actAttributes
            };
          } else {
            actionDetails = {
              type: "spawn",
              url: action.actUrl
            };
          }
          break;
        case "Animation":
        case "animation":
          if (this.enabled) {
            const objectUuid = this.parent ? this.parent.uuid : 'undefined'; // Assuming parent exists
            actionDetails = {
              type: "animation",
              data: `ApteroANIM_${action.actData}_${objectUuid}`,
              loop: action.actLoop,
              repeat: action.actRepeat,
              speed: action.actSpeed,
              reclick: action.actReclick
            };
          }
          break;
        case "Link":
        case "link":
          if (["API", "api"].includes(action.subMode)) {
            actionDetails = {
              type: "url",
              url: action.actUrl,
              mode: action.actMode,
              data: action.actData,
              config: action.actConfig
            };
          } else if (["Sidebar", "sidebar"].includes(action.subMode)) {
            actionDetails = {
              type: "sidebar_iframe",
              url: action.actUrl,
              title: action.actTitle
            };
          } else if (action.subMode === "Redirection" || action.subMode === "redirection") {
            actionDetails = {
              type: "url",
              url: action.actUrl,
              mode: 'change'
            };
          } else {
            actionDetails = {
              type: "url",
              url: action.actUrl,
              mode: null
            };
          }
          break;
        default:
          actionDetails = {
            type: "unknown"
          };
      }
      return actionDetails;
    });

    this.setUserData({
      "apt.action.controller.btn1": JSON.stringify([
        {
          actions: StringifiedActions,
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

    this.compileButtonConfigToUserData(this.config);

    this.updateHelperModel();

    return super.serialize({
      [ButtonNode.componentName]: {
        config: JSON.stringify(this.config)
      }
    });

  }
  /*static async deserialize(editor, json) {

    const node = await super.deserialize(editor, json);
    const { config } = json.components.find(c => c.name === ButtonNode.componentName).props;

    node.config = JSON.parse(config);
    return node;
  }*/
  static async deserialize(editor, json) {
    const node = await super.deserialize(editor, json);
    const { config } = json.components.find(c => c.name === ButtonNode.componentName).props;
    
    node.config = JSON.parse(config);
    
    // Check if the old properties exist and convert them to an action object
    if (node.config.mode || node.config.actUrl) {
        // This assumes that if 'mode' or 'actUrl' exists, the node is using the old format
        const actionObject = {
          mode: node.config.mode,
          subMode: node.config.subMode,
          actUrl: node.config.actUrl,
          actMediaFrame: node.config.actMediaFrame,
          actAttributes: node.config.actAttributes,
          actData: node.config.actData,
          actConfig: node.config.actConfig,
          actReclick: node.config.actReclick,
          actTitle: node.config.actTitle,
          actMode: node.config.actMode,
          actLoop: node.config.actLoop,
          actRepeat: node.config.actRepeat,
          actSpeed: node.config.actSpeed
        }
        
        // Initialize actions array with this single converted action
        node.config.actions = [actionObject];
        
        // Optionally, clean up old properties from the config to avoid confusion
        delete node.config.mode;
        delete node.config.subMode;
        delete node.config.actUrl;
        // Delete other action-related properties similarly
    } else {
        // New format already, ensure actions is an array (if not, initialize it)
        node.config.actions = node.config.actions || [];
    }

    return node;
  }

  onDeselect() {
    super.onDeselect();
    // Clear array
    
  }

  
  prepareForExport() {
    super.prepareForExport();

    //SetUserData for export (not for the editor)
    this.compileButtonConfigToUserData(this.config);
    super.serialize({ [ButtonNode.componentName]: { config: JSON.stringify(this.config) } });
    
    this.remove(this.helper);
  }

}
