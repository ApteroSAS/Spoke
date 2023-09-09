import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { QuestionCircle } from "styled-icons/fa-regular/QuestionCircle";
import { InfoTooltip } from "../layout/Tooltip";
import ResetButton from "./ResetButton";
import BooleanInput from "./BooleanInput";
import { PropertyLabel } from "./PropertyLabel";

const InputGroupContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding: 4px 8px;
  min-height: 24px;
  align-items: center;

  ${props =>
    props.disabled &&
    `
    pointer-events: none;
    opacity: 0.3;
  `}

  & > label {
    display: block;
    color: ${props => props.theme.text2};
    padding-bottom: 2px;
    padding-top: 4px;
  }
`;

const InputGroupContent = styled.div`
  ${props =>
    props.disabled &&
    `
    pointer-events: none;
    opacity: 0.3;
  `}
  display: flex;
  flex-direction: row;
  flex: 2;
  padding-left: 8px;
  align-items: center;
`;

const InputGroupInfoIcon = styled(QuestionCircle)`
  width: 20px;
  display: flex;
  padding-left: 8px;
  color: ${props => props.theme.blue};
  cursor: pointer;
  align-self: center;
`;

const InputGroupHeader = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  align-items: center;

  ${props =>
    props.disabled &&
    `
    pointer-events: none;
    opacity: 0.3;
  `}

  & > :first-child {
    padding-right: 8px;
  }
`;

const OptionalGroup = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  align-items: center;

  ${props =>
    props.disabled &&
    `
    pointer-events: none;
    opacity: 0.3;
  `}
`;

function InputGroupInfo({ info }) {
  return (
    <InfoTooltip info={info}>
      <InputGroupInfoIcon />
    </InfoTooltip>
  );
}

InputGroupInfo.propTypes = {
  info: PropTypes.string
};

export default function InputGroupExpandable({ name, children, disabled, info, optional, enabled, onEnable, reset, onReset }) {
  return (
    <InputGroupContainer disabled={disabled}>
      <InputGroupHeader>
        {optional && <BooleanInput value={enabled} onChange={onEnable} />}
        <OptionalGroup disabled={optional && !enabled}>
          {name && <PropertyLabel modified={!reset}>{name}:</PropertyLabel>}
        </OptionalGroup>
      </InputGroupHeader>
      <InputGroupContent disabled={optional && !enabled}>
        {children}
        {info && <InputGroupInfo info={info} />}
        {onReset && <ResetButton disabled={!reset} onClick={onReset} />}
      </InputGroupContent>
    </InputGroupContainer>
  );
}

InputGroupExpandable.propTypes = {
  name: PropTypes.string,
  children: PropTypes.any,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  info: PropTypes.string,
  optional: PropTypes.bool,
  enabled: PropTypes.bool,
  onEnable: PropTypes.func,
  onReset: PropTypes.func,
  reset: PropTypes.bool
};
