import EditorNodeMixin from "./EditorNodeMixin";
import { Object3D, PlaneBufferGeometry, MeshBasicMaterial, Mesh, DoubleSide, SphereBufferGeometry, CircleGeometry, ShaderMaterial, } from "three";

import linkIconUrl from "../../assets/apteroelements/HyperbeamPng.png";
import loadTexture from "../utils/loadTexture";
import { AudioElementType } from "../objects/AudioParams";


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
  youtubeCC: false,
  youtubeCCLang: "en",
  youtubeCCLangOther: "",
  youtubePlaylistID: "",
  youtubeLoop: false,
  processingSession: 0,
  universalStream: false,
  // Audio parameters
  HBFalloffDistance: 3,
  HBAdvancedAudio: false,
  audioType: AudioElementType.VIDEO, // or the appropriate type from AudioParams
  gain: 1.0, // Volume
  distanceModel: 'linear',
  rolloffFactor: 1,
  refDistance: 1,
  maxDistance: 100,
  coneInnerAngle: 360,
  coneOuterAngle: 0,
  coneOuterGain: 0,
  showAudioSphere: false,
  showAudioOuter: false,
  showAudioInner: false,
};

function generateObject(from) {
  return Object.keys(defaultProperties).reduce((obj, property) => {
    obj[property] = from[property];
    return obj;
  }, {});
}

function addEmbedQuery(pQuery, query) {
  if (pQuery.querys === 0) {
    pQuery.url += "?";
  } else {
    pQuery.url += "&";
  }
  pQuery.url += query;
  pQuery.querys++;
}

function getYouTubeEmbedLink(url, pThis) {
  // Extract the video ID from the YouTube URL
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length == 11) {
    // Create the embed link
    const processQuery = {
      url: `https://www.youtube.com/embed/${match[2]}`,
      querys: 0,
    }

    if (pThis.youtubeAutoPlay) {
      addEmbedQuery(processQuery, "autoplay=1");
    }
    if (pThis.youtubeCC) {
      addEmbedQuery(processQuery, "cc_load_policy=1");
      if (pThis.youtubeCCLangOther === "") {
        addEmbedQuery(processQuery, 
          `cc_lang_pref=${pThis.youtubeCCLangOther === "" ? pThis.youtubeCCLang : pThis.youtubeCCLangOther}`);
      }
    }
    if (pThis.youtubePlaylistID !== "" || (pThis.youtubePlaylistID === "" && pThis.youtubeLoop)) {
      // Looping a video requires us to define a playlist as either the video itself or a playlist ID (if defined)
      // This code takes into consideration both scenarios
      const playlistID = pThis.youtubePlaylistID === "" ? match[2] : pThis.youtubePlaylistID;
      addEmbedQuery(processQuery, "playlist=" + playlistID);
    }
    if (pThis.youtubeLoop) {
      addEmbedQuery(processQuery, "loop=1");
    }

    console.log("Valid YouTube URL", processQuery.url);
    return processQuery.url;
  } else {
    console.log('Invalid YouTube URL');
    return url;
  }
}

// This shader is used to create the gradient for the audio cone, so we can see how the outer gain is applied
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform float outerGain; // Value from 0 to 1

  void main() {
    // Calculate radial distance from the center (0.5, 0.5)
    float r = distance(vUv, vec2(0.5, 0.5)) * 2.0; // Adjusted for [0,1] range

    // Define colors for the center and the border
    vec3 fullColor = vec3(1.0, 1.0, 0.0);
    vec3 emptyColor = vec3(1.0, 0.0, 0.0);


    // Mix between yellow and red based on outerGain and distance
    vec3 color = mix(fullColor, emptyColor, smoothstep(0.0, outerGain, r));

    gl_FragColor = vec4(color, 0.5);
  }
`;

const fragmentShaderB = `
  varying vec2 vUv;

  void main() {
    // Calculate radial distance from the center (0.5, 0.5)
    float r = distance(vUv, vec2(0.5, 0.5)) * 2.0; // Adjusted for [0,1] range

    // Define colors for the center and the border
    vec3 fullColor = vec3(1.0, 1.0, 0.0);
    vec3 emptyColor = vec3(1.0, 0.4, 0.0);
    vec3 color = mix(fullColor, emptyColor, smoothstep(0.0, 1.0, r));

    gl_FragColor = vec4(color, 0.5);
  }
`;



// Don't glitch out if we ctrl+z when the element is not selected
let selectStatus = false;

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

    // Add a sphere to the helper to make it easier to select
    const sphereGeometry = new SphereBufferGeometry(this.maxDistance/5, 32, 32);
    const sphereMaterial = new MeshBasicMaterial({
      color: 0x0099ff,
      transparent: true,
      opacity: 0.15,
      side: DoubleSide,
    });
    this.audioMaxDistanceSphere = new Mesh(sphereGeometry, sphereMaterial);
    this.audioMaxDistanceSphere.visible = false; // Initially invisible
    this.add(this.audioMaxDistanceSphere);

    // Outer Radial (INNER CONE)
    this.audioRadialHelper = this.createRadialHelper(2);
    this.audioRadialHelper.visible = false; // Initially invisible
    this.add(this.audioRadialHelper);

    // Outer Radial (OUTER CONE)
    this.audioRadialHelperOut = this.createRadialHelper(0);
    this.audioRadialHelperOut.visible = false; // Initially invisible
    this.add(this.audioRadialHelperOut);

    // Inner Radial
    this.audioRadialHelperInner = this.createRadialHelper(1);
    this.audioRadialHelperInner.visible = false; // Initially invisible
    this.add(this.audioRadialHelperInner);
  }
  createRadialHelper(type) {
    const geometry = new CircleGeometry(0.01, 32, 0, Math.PI * 2);
    let material;
    if (type === 0) { // Outer radial
      material = new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          outerGain: { value: this.coneOuterGain }
        },
        side: DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
    } else if (type == 1) { // Inner radial
      material = new MeshBasicMaterial({
        color: 0xffcc00, // Radial color
        side: DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
    } else {//(type == 2) { // Outer radial (inner cone)
      material = new ShaderMaterial({
        vertexShader,
        fragmentShader: fragmentShaderB,
        side: DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
    }
    const radial = new Mesh(geometry, material);
    radial.rotation.x = -Math.PI / 2; // Plane top
    // Move up a bit to avoid Z-fighting with the outer cone
    if (type === 0 || type === 2) {
      radial.position.y = .001;
      radial.rotation.z = type === 0 ? -Math.PI / 2 : Math.PI / 2; //Rotate 180°
    } else {
      radial.rotation.z = Math.PI / 2; // Face front
    }

    // Adjust the geometry to create the radial shape based on the cone angles
    this.updateRadialGeometry(radial, type);

    return radial;
  }
  updateRadialGeometry(radial, type) {
    // Calculate the start and end angles based on coneInnerAngle and coneOuterAngle
    const baseAngle = -Math.PI;
    let radAngle;
    if (type === 0) {
      radAngle = this.coneOuterAngle * Math.PI / 180;
    } else if (type === 2) {
      radAngle = (360 - this.coneOuterAngle) * Math.PI / 180;
    } else {
      radAngle = this.coneInnerAngle * Math.PI / 180;
    }

    const startAngle = baseAngle-radAngle * 0.5;
    const endAngle = baseAngle+radAngle * 0.5;

    // Create a new geometry representing the sector (radial mouth)
    // Make it invisible if the coneOuterAngle is 0
    if (radAngle === 0) {
      radial.geometry = new CircleGeometry(0.01, 3, 0, 0.01);
    } else {
      radial.geometry = new CircleGeometry(this.maxDistance/5, 32, startAngle, endAngle - startAngle);
    }
    radial.geometry.verticesNeedUpdate = true;
  }

  // Override onSelect
  onSelect() {
    super.onSelect(); // Call the base class method
    selectStatus = true;
    if (this.showAudioSphere && this.HBAdvancedAudio) {
      this.audioMaxDistanceSphere.visible = true; // Show the sphere when selected
    }
    if (this.showAudioOuter && this.HBAdvancedAudio) {
      this.audioRadialHelper.visible = true;
      this.audioRadialHelperOut.visible = true;
    }
    if (this.showAudioInner && this.HBAdvancedAudio) {
      this.audioRadialHelperInner.visible = true;
    }
  }

  // Override onDeselect
  onDeselect() {
    super.onDeselect(); // Call the base class method
    this.audioMaxDistanceSphere.visible = false; // Hide the sphere when deselected
    this.audioRadialHelper.visible = false;
    this.audioRadialHelperOut.visible = false;
    this.audioRadialHelperInner.visible = false;
    selectStatus = false;
  }
  onUpdate() {
    super.onUpdate();
    if (this.HBAdvancedAudio && selectStatus) {

      this.audioMaxDistanceSphere.visible = this.showAudioSphere ? true : false;

      this.audioRadialHelper.visible = this.showAudioOuter ? true : false;
      this.audioRadialHelperOut.visible = this.showAudioOuter ? true : false;

      this.audioRadialHelperInner.visible = this.showAudioInner ? true : false;


      // Update shader uniform
      if (this.audioRadialHelperOut.material instanceof ShaderMaterial) {
        this.audioRadialHelperOut.material.uniforms.outerGain.value = this.coneOuterGain;
        this.audioRadialHelperOut.material.needsUpdate = true;
      }

      this.audioMaxDistanceSphere.geometry = new SphereBufferGeometry(this.maxDistance/5, 32, 32);
      this.updateRadialGeometry(this.audioRadialHelper, 0);
      this.updateRadialGeometry(this.audioRadialHelperInner, 1);
      this.updateRadialGeometry(this.audioRadialHelperOut, 2);
    }
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
      processedURL = getYouTubeEmbedLink(processedURL, this);
    }


    // Force default URL if empty
    if (processedURL === "") processedURL = "google.com"; 

    // Set the URL to the Hyperbeam protocol
    processedURL = processedURL.startsWith("hyperbeam://") ? processedURL : "hyperbeam://" + processedURL;

    const linkComponent = generateObject(this);
    linkComponent.href = processedURL;

    this.addGLTFComponent("link", linkComponent);
    this.addGLTFComponent("networked", {
      id: this.uuid
    });
    this.replaceObject();
  }
}
