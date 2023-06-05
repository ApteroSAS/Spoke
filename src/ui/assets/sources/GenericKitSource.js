import KitSource from "../KitSource";
import { TransformPivot } from "../../../editor/controls/SpokeControls";

export default class GenericKitSource extends KitSource {
  constructor(api) {
    super(api, "https://meet.aptero.co/service/static/kit/Chair/Chair_Kit.gltf");
    this.id = "chair-kit";
    this.name = "Chair Kit";
    this.transformPivot = TransformPivot.Selection;
  }
}
