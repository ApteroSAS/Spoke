/*import ModelMediaSource from "../ModelMediaSource";
import { TransformPivot } from "../../../editor/controls/SpokeControls";
import ModelNode from "../../../editor/nodes/ModelNode";
import { ItemTypes } from "../../dnd";

const folderUrl = "https://files.aptero.co/api/public/dl/YiPL3x9Q/";
//const jsonUrl = `${folderUrl}assetStructure.json`;
const jsonUrl = "https://files.aptero.co/api/public/dl/GKJC3wGj/dev/prod_opal_assets/Megapolis_Models/assetStructure.json";

export default class MegapolisKitSource extends ModelMediaSource {
  constructor(api) {
    super(api);
    this.id = "megapolis-kit";
    this.name = "Megapolis Models";
    this.tags = [];
    this.searchLegalCopy = "Search by Aptero Megapolis";
    this.privacyPolicyUrl = "https://aptero.co/privacy";
    this.transformPivot = TransformPivot.Bottom;
    this.folderStructure = {};
    console.log("MegapolisKitSource initialized. Starting to load folder structure...");
    this.loadFolderStructure();
  }

  async loadFolderStructure() {
    console.log("Fetching asset structure from:", `${folderUrl}assetStructure.json`);
    try {
        const response = await fetch(jsonUrl);
        console.log("Response received:", response);
        if (response.ok) {
            const structure = await response.json();
            console.log("Folder structure loaded successfully:", structure);
            this.setupCategories(structure);
        } else {
            console.error("Failed to load asset structure. Status:", response.status);
        }
    } catch (error) {
        console.error("Error loading asset structure:", error);
    }
}

  setupCategories(structure) {
      console.log("Setting up categories with the structure:", structure);
      this.tags = Object.entries(structure).map(([key, items]) => {
          const parts = key.split('.'); // Splits "Props.Props_Unity" into ["Props", "Props_Unity"]
          const label = parts.join(' > '); // Joins them as "Props > Props_Unity"
          return {
              label: label,
              value: key.toLowerCase(),
              children: items.map(item => ({
                  label: item.name,
                  value: folderUrl + (parts.join('/') + '/' + item.file), // Joins as "Props/Props_Unity/Fan_01.glb"
                  initialNodeProps: {
                      initialScale: item.scale,
                      castShadow: item.castShadow,
                      receiveShadow: item.receiveShadow
                  },
                  itemProps: {
                      transformPivot: item.transformPivot
                  }
              }))
          };
      });
      console.log("Categories set up successfully:", this.tags);
  }


  async search(params, cursor, abortSignal) {
    console.log("Search called with params:", params);
    const results = this.tags.flatMap(category =>
      category.children.filter(item => item.label.toLowerCase().includes(params.query.toLowerCase()))
    ).map(item => ({
      id: item.value,
      thumbnailUrl: item.value, // Placeholder or generate thumbnails if possible
      label: item.label,
      type: ItemTypes.Model,
      url: item.value,
      nodeClass: ModelNode,
      initialProps: item.initialNodeProps
    }));

    console.log("Search results:", results);
    return {
      results: results,
      nextCursor: null,
      hasMore: false
    };
  }
}
*/