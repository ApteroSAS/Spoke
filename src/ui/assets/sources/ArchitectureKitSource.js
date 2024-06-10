import KitSource from "../KitSource";
import { TransformPivot } from "../../../editor/controls/SpokeControls";

export default class ArchitectureKitSource extends KitSource {
  constructor(api) {
    super(
      api,
      "https://meet.aptero.co/service/static/kit/ArchKit/ArchKit-4127950833cadf21d6b6dec45b402639a0467e3a.gltf"
    );
    this.id = "architecture-kit";
    this.name = "Architecture Kit";
    this.transformPivot = TransformPivot.Selection;
    // Images take a while to load so we set a debounce timeout
    this.searchDebounceTimeout = 500;
  }
}
