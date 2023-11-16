import EditorNodeMixin from "./EditorNodeMixin";
import { Object3D, PlaneBufferGeometry, MeshBasicMaterial, Mesh, DoubleSide } from "three";
import linkIconUrl from "../../assets/apteroelements/HyperbeamPng.png";
import loadTexture from "../utils/loadTexture";

let linkHelperTexture = null;

/*
  Most script seem to copy properties one by one, so instead of doing that,
  we can use this method to generate an object with the properties that we want.
  This will allow us to add new properties without having to update
  the copy/serialize/deserialize methods ;).
*/
const defaultProperties = {
  href: "google.com",
  HBRegion: "NA",
  HBBrowserNav: true,
  HBDarkMode: false,
  HBWebGL: false,
  HBRes: 720,
  HBFps: 24,
  HBQlty: "smooth",
  HBuBlock: false,
  HBSession: null,
  HBPersistent: false,
  HBNoCursors: false,
  HBStready: false,
  HBRestricted: false,
  HBPermissions: [],
  HBForceYoutube: false,
  isYoutubeLink: false,
  youtubeAutoPlay: false,
  processingSession: 0,
};

function generateObject(from) {
  return Object.keys(defaultProperties).reduce((obj, property) => {
    obj[property] = from[property];
    return obj;
  }, {});
}

function getYouTubeEmbedLink(url, youtubeAutoPlay = false) {
  // Extract the video ID from the YouTube URL
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length == 11) {
      // Create the embed link
      let embedLink = `www.youtube.com/embed/${match[2]}`;
      if (youtubeAutoPlay) {
          embedLink += "?autoplay=1";
      }
      console.log("Valid YouTube URL", embedLink);
      return embedLink;
  } else {
      console.log('Invalid YouTube URL');
      return url;
  }
}

export default class HBElementNode extends EditorNodeMixin(Object3D) {
  static componentName = "hbelement";
  static nodeName = "3D Internet Screen";
  static subtype = "aptero";

  static async load() {
    linkHelperTexture = await loadTexture(linkIconUrl);
  }

  static async deserialize(editor, json) {
    const node = await super.deserialize(editor, json);

    const hbProps = json.components.find(c => c.name === "hbelement").props;
    
    Object.assign(node, hbProps);

    return node;
  }


  constructor(editor) {
    super(editor);

    Object.assign(this, defaultProperties);

    const geometry = new PlaneBufferGeometry(1, 0.5625);
    const material = new MeshBasicMaterial();
    material.map = linkHelperTexture;
    material.side = DoubleSide;
    material.transparent = true;

    // Adjust UVs to match the aspect ratio of the object so the texture isn't stretched
    const textureAspect = linkHelperTexture.image.width / linkHelperTexture.image.height;
    const planeAspect = 0.5625 / 1;  
    const uvScale = planeAspect / textureAspect;
    const uvs = geometry.attributes.uv;
    for (let i = 0; i < uvs.count; i++) {
        const newY = 0.5 + (uvs.getY(i) - 0.5) * uvScale;
        uvs.setY(i, newY);
    }
    geometry.attributes.uv.needsUpdate = true;

    this.helper = new Mesh(geometry, material);
    this.helper.layers.set(1);
    this.add(this.helper);
  }

  copy(source, recursive = true) {
    if (recursive) {
      this.remove(this.helper);
    }

    super.copy(source, recursive);

    if (recursive) {
      const helperIndex = source.children.findIndex(child => child === source.helper);

      if (helperIndex !== -1) {
        this.helper = this.children[helperIndex];
      }
    }

    //Copy all the properties from the source to this
    Object.assign(this, generateObject(source));

    return this;
  }
  
  serialize() {
    return super.serialize({hbelement: generateObject(this)});
  }

  async prepareForExport() {
    super.prepareForExport();
    this.remove(this.helper);

    // Remove http or https from the text using REGEX
    let processedURL = this.href.replace(/(http:\/\/|https:\/\/)/g, "");

    // Process Youtube links if HBForceYoutube and isYoutubeLink are true
    if (this.HBForceYoutube && this.isYoutubeLink) {
      processedURL = getYouTubeEmbedLink(processedURL, this.youtubeAutoPlay);
    }


    // Force default URL if empty
    if (processedURL === "") processedURL = "google.com"; 

    // Set the URL to the Hyperbeam protocol
    processedURL = processedURL.startsWith("hyperbeam://") ? processedURL : "hyperbeam://" + processedURL;

    const linkComponent = generateObject(this);
    linkComponent.href = processedURL;

    console.log("linkComponent", linkComponent);

    this.addGLTFComponent("link", linkComponent);
    this.addGLTFComponent("networked", {
      id: this.uuid
    });
    this.replaceObject();
  }
}
