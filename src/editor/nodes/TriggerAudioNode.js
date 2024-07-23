import { Material, BoxBufferGeometry, Object3D, Mesh, Vector3, MeshBasicMaterial, DoubleSide, NearestFilter} from "three";
import EditorNodeMixin from "./EditorNodeMixin";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import linkIconUrl from "../../assets/apteroelements/AudioZoneBorder.png";
import loadTexture from "../utils/loadTexture"

let linkHelperTexture = null;

const loader = new GLTFLoader();

function copyVector3(v,d) { 
  if (!v) return d;
  return new Vector3(v.x ? v.x : d.x, v.y ? v.y : d.y, v.z ? v.z : d.z);
}

export default class TriggerAudioNode extends EditorNodeMixin(Object3D) {
  static componentName = "trigger-audio";

  static subtype = "aptero";

  static experimental = false;

  static nodeName = "Audio Zone Trigger";

  static _geometry = new BoxBufferGeometry();

  static _material = new Material();

  static async load() {
    linkHelperTexture = await loadTexture(linkIconUrl);
  }

  static async deserialize(editor, json) {
    const node = await super.deserialize(editor, json);

    const props = json.components.find(c => c.name === "trigger-audio").props;

    node.target = props.target;
    node.sidebarName = props.sidebarName;
    node.linkSource = props.linkSource ? props.linkSource : "";
    node.customTitle = props.customTitle ? props.customTitle : "";
    node.buttonIcon = props.buttonIcon;
    node.universalAudio = props.universalAudio? props.universalAudio : false;
    node.audioChannel = props.audioChannel ? props.audioChannel : 0;
    node.systemMode = props.systemMode ? props.systemMode : "room"

    node.barrierUrl = props.barrierUrl ? props.barrierUrl : "";
    node.logoUrl = props.logoUrl ? props.logoUrl : "";

    node.barrierUserScale = copyVector3(props.barrierUserScale, new Vector3(0.25, 0.25, 0.25));
    node.logoUserScale = copyVector3(props.logoUserScale, new Vector3(0.5, 0.5, 0.5));
    node.barrierOffset = copyVector3(props.barrierOffset, new Vector3(0, 0, 0));
    node.logoOffset = copyVector3(props.logoOffset, new Vector3(0, 0.5, 0));
    
    // legacy properties
    node.enterComponent = props.enterComponent;
    node.enterProperty = props.enterProperty;
    node.enterValue = props.enterValue;
    node.leaveComponent = props.leaveComponent;
    node.leaveProperty = props.leaveProperty;
    node.leaveValue = props.leaveValue;
    return node;
  }

  onChange(property, value) {
    super.onChange(property, value);

    this.scale.x === 0 ? this.scale.x = 1 : this.scale.x;
    this.scale.y === 0 ? this.scale.y = 1 : this.scale.y;
    this.scale.z === 0 ? this.scale.z = 1 : this.scale.z;
    this.logoUserScale.x === 0 ? this.logoUserScale.x = 1 : this.logoUserScale.x;
    this.logoUserScale.y === 0 ? this.logoUserScale.y = 1 : this.logoUserScale.y;
    this.logoUserScale.z === 0 ? this.logoUserScale.z = 1 : this.logoUserScale.z;
    this.barrierUserScale.x === 0 ? this.barrierUserScale.x = 1 : this.barrierUserScale.x;
    this.barrierUserScale.y === 0 ? this.barrierUserScale.y = 1 : this.barrierUserScale.y;
    this.barrierUserScale.z === 0 ? this.barrierUserScale.z = 1 : this.barrierUserScale.z;

    /*
      Keep Logo size and position CONSISTENT
      (By default is resized and repositioned with the main object, we don't want that)
    */
    if (property === "scale" && this.logoModel) {
      // Lock the scale of the logoModel (Only the BARRIER has to scale with the Trigger Area)
      this.logoModel.scale.set(
        this.logoUserScale.x / this.scale.x, 
        this.logoUserScale.y / this.scale.y, 
        this.logoUserScale.z / this.scale.z
        );

      // We also reposition the logoModel to the bottom of the barrier
      this.logoModel.position.set(
        this.logoOffset.x / this.scale.x,
        this.logoOffset.y / this.scale.y -0.5,
        this.logoOffset.z / this.scale.z
      );
      this.logoModel.updateMatrix();

      // Update the y scale of the barrierModel too
      if (this.barrierModel) {
        this.barrierModel.scale.y = this.barrierUserScale.y / this.scale.y;
        this.barrierModel.updateMatrix();
      }
    }

    // Update LOGO
    if (property === "logoOffset" && this.logoModel) {
      this.logoModel.position.set(
        this.logoOffset.x / this.scale.x, 
        this.logoOffset.y / this.scale.y -0.5,
        this.logoOffset.z / this.scale.z);
      this.logoModel.updateMatrix();
    }
    if (property === "logoUserScale" && this.logoModel) {
      // Update scale based on the user input
      this.logoModel.scale.set(
        this.logoUserScale.x / this.scale.x, 
        this.logoUserScale.y / this.scale.y, 
        this.logoUserScale.z / this.scale.z);
      this.logoModel.updateMatrix();
    }

    // Update BARRIER
    if (property === "barrierOffset" && this.barrierModel) {
      this.barrierModel.position.set(
        this.barrierOffset.x, 
        this.barrierOffset.y -0.5,
        this.barrierOffset.z);
      this.barrierModel.updateMatrix();
    }
    if (property === "barrierUserScale" && this.barrierModel) {
      // Update scale based on the user input
      this.barrierModel.scale.set(
        this.barrierUserScale.x, 
        this.barrierUserScale.y / this.scale.y, 
        this.barrierUserScale.z);
      this.barrierModel.updateMatrix();
    }

    // UPDATE MODELS
    if (property === "barrierUrl") {
      // Remove the old barrier model
      if (this.barrierModel && this.helper) {
        this.helper.remove(this.barrierModel);
      }
      // Load the new barrier model
      if (this.barrierUrl && this.barrierUrl !== "") {
        const fileExtension = this.barrierUrl.split('.').pop().toLowerCase();
        if (fileExtension === 'glb' || fileExtension === 'gltf') {
          try {
            loader.load(this.barrierUrl, (gltf) => {
              try {
                const barrierModel = gltf.scene;
                barrierModel.scale.set(
                  this.barrierUserScale.x, 
                  this.barrierUserScale.y / this.scale.y, 
                  this.barrierUserScale.z);
                barrierModel.position.set(
                  this.barrierOffset.x,
                  this.barrierOffset.y -0.5,
                  this.barrierOffset.z);
                this.barrierModel = barrierModel; // Save the barrier model for later use
                this.helper.add(barrierModel); // Add the barrier model to the scene
              } catch (error) {
                console.error("Error adding barrier model", error);
              }
            });
          } catch (error) {
            console.error("Error loading barrier model", error);
          }
        }
      }
    }
    if (property === "logoUrl") {
      // Remove the old logo model
      if (this.logoModel && this.helper) {
        this.helper.remove(this.logoModel);
      }
      // Load the new logo model
      if (this.logoUrl && this.logoUrl !== "") {
        const fileExtension = this.logoUrl.split('.').pop().toLowerCase();
        if (fileExtension === 'glb' || fileExtension === 'gltf') {
          try {
            loader.load(this.logoUrl, (gltf) => {
              try {
                const logoModel = gltf.scene;
                logoModel.scale.set(
                  this.logoUserScale.x / this.scale.x, 
                  this.logoUserScale.y / this.scale.y, 
                  this.logoUserScale.z / this.scale.z);
                logoModel.position.set(
                  this.logoOffset.x / this.scale.x, 
                  this.logoOffset.y / this.scale.y -0.5, 
                  this.logoOffset.z / this.scale.z);
                this.logoModel = logoModel; // Save the logo model for later use
                this.helper.add(logoModel); // Add the logo model to the scene
              } catch (error) {
                console.error("Error adding logo model", error);
              }
            });
          } catch (error) {
            console.error("Error loading logo model", error);
          }
        }
      }
    }
  }

  onAdd() {
    // -->BARRIER AND LOGO

    if (this.barrierUrl && this.barrierUrl !== ""){
      loader.load(this.barrierUrl, (gltf) => {
        // REMOVE IF ALREADY EXISTS
        if (this.barrierModel && this.helper) {
          this.helper.remove(this.barrierModel);
        }


        const barrierModel = gltf.scene;
      
        // Scale the barrier model
        barrierModel.scale.set(
          this.barrierUserScale.x,
          this.barrierUserScale.y / this.scale.y,
          this.barrierUserScale.z);
        // Position the barrier model
        barrierModel.position.set(
          this.barrierOffset.x,
          this.barrierOffset.y -0.5,
          this.barrierOffset.z);
        
        this.helper.add(barrierModel); 
        this.barrierModel = barrierModel; 
        this.onChange("barrierOffset");
        this.onChange("barrierUserScale");
      });
      
    }

    if (this.logoUrl && this.logoUrl !== "") {
      // Load the logo model inside the load callback of the barrier to ensure correct sequencing
      loader.load(this.logoUrl, (gltf) => {

        // REMOVE IF ALREADY EXISTS
        if (this.logoModel && this.helper) {
          this.helper.remove(this.logoModel);
        }

        const logoModel = gltf.scene;
        logoModel.scale.set(
          this.logoUserScale.x / this.scale.x,
          this.logoUserScale.y / this.scale.y,
          this.logoUserScale.z / this.scale.z);
        logoModel.position.set(
          this.logoOffset.x / this.scale.x,
          this.logoOffset.y / this.scale.y -0.5,
          this.logoOffset.z / this.scale.z);

        this.logoModel = logoModel; 

        this.helper.add(logoModel);
        this.onChange("logoOffset");
        this.onChange("logoUserScale");
      });
    }
    //this.helper.update();
  }

  constructor(editor) {
    super(editor);

    // -->New BoxHelper method, the old one had issues with the Raycaster
    linkHelperTexture.magFilter = NearestFilter;
    linkHelperTexture.minFilter = NearestFilter;
    const boxMeshMaterial = new MeshBasicMaterial({ 
      map: linkHelperTexture, 
      transparent: true, 
      opacity: 0.75,
      depthWrite: false,
      side: DoubleSide,
      color: 0xffff11,
    });
    const boxMesh = new Mesh(TriggerAudioNode._geometry, boxMeshMaterial);

    boxMesh.position.y = 0.5; // Set the position to the bottom
    boxMesh.layers.set(1);

    this.helper = boxMesh;
    this.add(boxMesh);

    this.barrierModel = null;
    this.logoModel = null;

    this.target = null;
    this.sidebarName = "";
    this.linkSource = "";
    this.customTitle = "";
    this.buttonIcon = "VoiceOver";
    this.universalAudio = false;
    this.audioChannel = 0;
    this.systemMode = "room";

    // Use Morgane's barrier and logo as default
    this.barrierUrl = "https://meet.aptero.co/files/0745f3db-8841-43e3-a89c-a137bf9b0a96.glb";
    this.logoUrl = "https://meet.aptero.co/files/3915ee50-8543-445d-b037-ba3518db0077.glb";
    this.barrierUserScale = new Vector3(0.25, 0.25, 0.25);
    this.logoUserScale = new Vector3(0.5, 0.5, 0.5);
    this.barrierOffset = new Vector3(0, 0, 0);
    this.logoOffset = new Vector3(0, 0.5, 0);

    // legacy properties
    this.enterComponent = null;
    this.enterProperty = null;
    this.enterValue = null;
    this.leaveComponent = null;
    this.leaveProperty = null;
    this.leaveValue = null;
  }

  
  

  copy(source, recursive = true) {
    const barrierBuffer = source.barrierModel;
    const logoBuffer = source.logoModel;


    if (!window.sceneExportCloning) {
      source.helper.remove(barrierBuffer);
      source.helper.remove(logoBuffer);
    }

    if (recursive) {
      this.remove(this.helper);
    }

    super.copy(source, recursive);

    if (recursive) {
      const helperIndex = source.children.indexOf(source.helper);

      if (helperIndex !== -1) {
        this.helper = this.children[helperIndex];
      }
    }

    /*
      This is the best I could come up with...
      So, Whenever we make a copy of the TriggerAudioNode, the copy comes with a copy of the models from the original, BUT IT ALSO creates a new copy of the models in the original.
    */
    if (!window.sceneExportCloning) {
      source.helper.add(barrierBuffer);
      source.helper.add(logoBuffer);
    }
    

    this.target = source.target;
    this.sidebarName = source.sidebarName;
    this.linkSource = source.linkSource ? source.linkSource : "";
    this.customTitle = source.customTitle ? source.customTitle : "";
    this.buttonIcon = source.buttonIcon;
    this.universalAudio = source.universalAudio ? source.universalAudio : false;
    this.audioChannel = source.audioChannel ? source.audioChannel : 0;
    this.systemMode = source.systemMode ? source.systemMode : "room";
    this.barrierUrl = source.barrierUrl ? source.barrierUrl : "";
    this.logoUrl = source.logoUrl ? source.logoUrl : "";
    this.barrierUserScale = source.barrierUserScale ? source.barrierUserScale : new Vector3(0.25, 0.25, 0.25)
    this.logoUserScale = source.logoUserScale ? source.logoUserScale : new Vector3(0.5, 0.5, 0.5);
    this.barrierOffset = source.barrierOffset ? source.barrierOffset : new Vector3(0, 0, 0);
    this.logoOffset = source.logoOffset ? source.logoOffset : new Vector3(0, 0.5, 0);


    this.enterComponent = source.enterComponent;
    this.enterProperty = source.enterProperty;
    this.enterValue = source.enterValue;
    this.leaveComponent = source.leaveComponent;
    this.leaveProperty = source.leaveProperty;
    this.leaveValue = source.leaveValue;

    return this;
  }

  serialize() {
    return super.serialize({
      "trigger-audio": {
        target: this.target,
        sidebarName: this.sidebarName,
        linkSource: this.linkSource ? this.linkSource : "",
        customTitle: this.customTitle ? this.customTitle : "",
        buttonIcon: this.buttonIcon,
        universalAudio: this.universalAudio ? this.universalAudio : false,
        audioChannel: this.audioChannel ? this.audioChannel : 0,
        systemMode: this.systemMode ? this.systemMode : "room",


        barrierUrl: this.barrierUrl ? this.barrierUrl : "",
        logoUrl: this.logoUrl ? this.logoUrl : "",
        barrierUserScale: this.barrierUserScale ? this.barrierUserScale : new Vector3(0.25, 0.25, 0.25),
        logoUserScale: this.logoUserScale ? this.logoUserScale : new Vector3(0.5, 0.5, 0.5),
        barrierOffset: this.barrierOffset ? this.barrierOffset : new Vector3(0, 0, 0),
        logoOffset: this.logoOffset ? this.logoOffset : new Vector3(0, 0.5, 0),

        enterComponent: this.enterComponent,
        enterProperty: this.enterProperty,
        enterValue: this.enterValue,
        leaveComponent: this.leaveComponent,
        leaveProperty: this.leaveProperty,
        leaveValue: this.leaveValue
      }
    });
  }

  prepareForExport() {
    super.prepareForExport();

    this.remove(this.helper);


    const scale = new Vector3();
    this.getWorldScale(scale);

    this.addGLTFComponent("trigger", {
      size: { x: scale.x, y: scale.y, z: scale.z },
      sidebarName: this.sidebarName,
      linkSource: "https://horus.aptero.co/"+this.systemMode+"/",
      customTitle: encodeURIComponent(this.customTitle),
      buttonIcon: this.buttonIcon,
      audioMode: true,
      universalAudio: this.universalAudio,
      audioChannel: this.audioChannel,
      triggerModels: JSON.stringify({
        barrierCore: {
          src: this.barrierUrl,
          scale: {
            x: this.barrierUserScale.x * scale.x,
            y: this.barrierUserScale.y * scale.y,
            z: this.barrierUserScale.z * scale.z
          },
          position: {
            x: this.barrierOffset.x + this.position.x,
            y: this.barrierOffset.y + this.position.y,
            z: this.barrierOffset.z + this.position.z
          },
        },
        logoCore: {
          src: this.logoUrl,
          scale: {
            x: this.logoUserScale.x,
            y: this.logoUserScale.y,
            z: this.logoUserScale.z
          },
          position: {
            x: this.logoOffset.x + this.position.x,
            y: this.logoOffset.y + this.position.y,
            z: this.logoOffset.z + this.position.z
          },
        }
      }),

    });
  }
}
