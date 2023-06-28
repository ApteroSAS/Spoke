import React from "react";
import PropTypes from "prop-types";
import configs from "../configs";
import PreviewDialog from "../ui/dialogs/PreviewDialog";
import { Button } from "../ui/inputs/Button";
import { isInsideIFrame } from "../aptero/MsTeams";

export default function PublishedSceneDialog({ onCancel, sceneName, sceneUrl, screenshotUrl, ...props }) {
  return (
    isInsideIFrame()?(
      <PreviewDialog imageSrc={screenshotUrl} title="Scene Published" {...props}>
        <h1>{sceneName}</h1>
        <p>Your scene has been published.</p>
        <p>You can now add the 3D room where you want in teams (Meeting extension, Tab, Chat). Click on the contextual "Add App" menu.</p>
        <p>If a room was already created using this scene, The room will be updated automatically using this scene</p>
      </PreviewDialog>
      ):(
    <PreviewDialog imageSrc={screenshotUrl} title="Scene Published" {...props}>
      <h1>{sceneName}</h1>
      <p>Your scene has been published.</p>
      <Button as="a" href={sceneUrl} target="_blank">
        View Your Scene
      </Button>
    </PreviewDialog>)
  );
}

PublishedSceneDialog.propTypes = {
  onCancel: PropTypes.func.isRequired,
  sceneName: PropTypes.string.isRequired,
  sceneUrl: PropTypes.string.isRequired,
  screenshotUrl: PropTypes.string.isRequired
};
