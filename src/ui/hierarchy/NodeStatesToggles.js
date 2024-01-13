import React, { useCallback, useContext } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { InfoTooltip } from "../layout/Tooltip";
import { Eye } from "styled-icons/fa-solid/Eye";
import { EyeSlash } from "styled-icons/fa-solid/EyeSlash";
import { ToggleOff } from "styled-icons/fa-solid/ToggleOff";
import { ToggleOn } from "styled-icons/fa-solid/ToggleOn";
import { EditorContext } from "../contexts/EditorContext";
import { Lock } from "styled-icons/fa-solid/Lock";
import { Unlock } from "styled-icons/fa-solid/Unlock";

const IconContainer = styled.div`
  display: inline-flex;
  margin-right: 4px;
  cursor: pointer;
  position: relative;
`;

const VisIcon = styled(Eye)`
  color: lightgray;
`;
const VisOffIcon = styled(EyeSlash)`
  color: gray;
`;
const ToggleOnIcon = styled(ToggleOn)`
  color: lightgray;
`;
const ToggleOffIcon = styled(ToggleOff)`
  color: gray;
`;
const LockIcon = styled(Lock)`
  color: lightgray;
`;
const UnlockIcon = styled(Unlock)`
  color: gray;
`;

export default function NodeStatesToggles({ node }) {

  // Ignore the Main Hierachy node
  if (node.object.nodeName === "Scene") {
    return null;
  }

  // search lockedState in the window.lockedItems array
  let lockedState = window.lockedItems && window.lockedItems.find(item => item === node.object.uuid);

  const editor = useContext(EditorContext);

  const toggleVisibility = useCallback((event) => {
    event.stopPropagation();
    event.preventDefault();
    editor.setProperty(node.object, '_visible', !node.object._visible);
  }, [node, editor]);

  const toggleEnabled = useCallback((event) => {
    event.stopPropagation();
    event.preventDefault();
    editor.setProperty(node.object, 'enabled', !node.enabled);
  }, [node, editor]);

  const toggleLocked = useCallback((event) => {
    event.stopPropagation();
    event.preventDefault();
    // Make lockedState a part of the window.lockedItems array now instead of the node.object
    if (!window.lockedItems) {
      window.lockedItems = [];
    }

    const updateLockState = (object, lockState) => {
      if (lockState) {
        //console.log("Locking child", child.uuid) //hahaha "Locking child" hahaha
        window.lockedItems.push(object.uuid);
      } else {
        window.lockedItems = window.lockedItems.filter(item => item !== object.uuid);
      }

      const children = object.children;
      if (children && children.length > 0) {
        children.forEach(child => {
          if (child) {
            updateLockState(child, lockState);
          }
        });
      }
    };

    lockedState = !lockedState;
    updateLockState(node.object, lockedState);

    // Force UI update
    editor.setPropertySelected('enabled', node.enabled);

  }, [node, editor]);


  return (
    <>
      <InfoTooltip info={lockedState ? "Unlock" : "Lock"}>
        <IconContainer onMouseDown={toggleLocked}>
          {lockedState ? <LockIcon size={14} /> : <UnlockIcon size={14} />}
        </IconContainer>
      </InfoTooltip>
      <InfoTooltip info={node.object._visible ? "Hide" : "Unhide"}>
        <IconContainer onMouseDown={toggleVisibility}>
          {node.object._visible ? <VisIcon size={14} /> : <VisOffIcon size={14} />}
        </IconContainer>
      </InfoTooltip>
      <InfoTooltip info={node.enabled ? "Disable" : "Enable"}>
        <IconContainer onMouseDown={toggleEnabled}>
          {node.enabled ? <ToggleOnIcon size={14} /> : <ToggleOffIcon size={14} />}
        </IconContainer>
      </InfoTooltip>
    </>
  );
}

NodeStatesToggles.propTypes = {
  node: PropTypes.object.isRequired
};
