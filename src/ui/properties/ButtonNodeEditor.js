import React, { Component } from "react";
import PropTypes from "prop-types";
import NodeEditor from "./NodeEditor";
import { Image } from "styled-icons/boxicons-regular/Image";

export default class ButtonNodeEditor extends Component {
  static propTypes = {
    editor: PropTypes.object,
    node: PropTypes.object
  };

  static iconComponent = Image;

  static description =
    "A Button that can be used to trigger actions.";

  render() {
    return <NodeEditor description={ButtonNodeEditor.description} {...this.props} />;





  }
}
