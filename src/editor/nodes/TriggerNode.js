import { Material, BoxBufferGeometry, Object3D, Mesh, BoxHelper, Vector3 } from "three";
import EditorNodeMixin from "./EditorNodeMixin";

const requiredProperties = [
  "sidebarName",
  "linkSource",
  "buttonIcon",
  "audioMode",
  "universalAudio",
  "audioChannel"

  /*"target",
  "enterComponent",
  "enterProperty",
  "enterValue",
  "leaveComponent",
  "leaveProperty",
  "leaveValue"*/
];

export default class TriggerNode extends EditorNodeMixin(Object3D) {
  static componentName = "trigger";

  static subtype = "aptero";

  static experimental = false;

  static nodeName = "Trigger";

  static _geometry = new BoxBufferGeometry();

  static _material = new Material();

  static async deserialize(editor, json) {
    const node = await super.deserialize(editor, json);

    const props = json.components.find(c => c.name === "trigger").props;

    node.target = props.target;
    node.sidebarName = props.sidebarName;
    node.linkSource = props.linkSource ? props.linkSource : "";
    node.buttonIcon = props.buttonIcon;
    node.audioMode = props.audioMode? props.audioMode : false;
    node.universalAudio = props.universalAudio? props.universalAudio : false;
    node.audioChannel = props.audioChannel ? props.audioChannel : 0;
    // legacy properties
    node.enterComponent = props.enterComponent;
    node.enterProperty = props.enterProperty;
    node.enterValue = props.enterValue;
    node.leaveComponent = props.leaveComponent;
    node.leaveProperty = props.leaveProperty;
    node.leaveValue = props.leaveValue;

    return node;
  }

  constructor(editor) {
    super(editor);
    // Default initial values
    const boxMesh = new Mesh(TriggerNode._geometry, TriggerNode._material);
    const box = new BoxHelper(boxMesh, 0xffff00);
    box.layers.set(1);
    this.helper = box;
    this.add(box);
    this.target = null;
    this.sidebarName = "";
    this.linkSource = "";
    this.buttonIcon = "VoiceOver";
    this.audioMode = 0;
    this.universalAudio = 0;
    this.audioChannel = 0;
    // legacy properties
    this.enterComponent = null;
    this.enterProperty = null;
    this.enterValue = null;
    this.leaveComponent = null;
    this.leaveProperty = null;
    this.leaveValue = null;
  }

  copy(source, recursive = true) {
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

    this.target = source.target;
    this.sidebarName = source.sidebarName;
    this.linkSource = source.linkSource ? source.linkSource : "";
    this.buttonIcon = source.buttonIcon;
    this.audioMode = source.audioMode ? source.audioMode : false;
    this.universalAudio = source.universalAudio ? source.universalAudio : false;
    this.audioChannel = source.audioChannel ? source.audioChannel : 0;

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
      "trigger": {
        target: this.target,
        sidebarName: this.sidebarName,
        linkSource: this.linkSource ? this.linkSource : "",
        buttonIcon: this.buttonIcon,
        audioMode: this.audioMode ? this.audioMode : false,
        universalAudio: this.universalAudio ? this.universalAudio : false,
        audioChannel: this.audioChannel ? this.audioChannel : 0,

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

    for (const prop of requiredProperties) {
      if (this[prop] === null || this[prop] === undefined) {
        console.warn(`TriggerNode: property "${prop}" is required. Skipping...`);
        return;
      }
    }

    const scale = new Vector3();
    this.getWorldScale(scale);

    this.addGLTFComponent("trigger", {
      size: { x: scale.x, y: scale.y, z: scale.z },
      sidebarName: this.sidebarName,
      linkSource: this.linkSource,
      buttonIcon: this.buttonIcon,
      audioMode: this.audioMode,
      universalAudio: this.universalAudio,
      audioChannel: this.audioChannel,

      /*target: this.gltfIndexForUUID(this.target),
      enterComponent: this.enterComponent,
      enterProperty: this.enterProperty,
      enterValue: this.enterValue,
      leaveComponent: this.leaveComponent,
      leaveProperty: this.leaveProperty,
      leaveValue: this.leaveValue*/
    });
  }
}
