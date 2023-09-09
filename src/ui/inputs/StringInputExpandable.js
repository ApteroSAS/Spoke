import React, { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import styled, { withTheme } from "styled-components";
import Input from "./Input";


const StyledTextArea = styled.textarea`
  display: flex;
  width: calc(100% - 24px);
  background-color: ${props => (props.theme.inputBackground)};
  border-radius: 4px;
  border: 1px solid ${props => props.theme.border};
  color: ${props => props.theme.text};
  padding: 6px 8px;
  resize: vertical;
  min-height: 6em;
  height: 6em;
`;

const StringInputExpandable = React.forwardRef(({ theme, onChange, ...rest }, ref) => (
  <StyledTextArea onChange={e => onChange(e.target.value, e)} theme={theme} {...rest} ref={ref} />
));

StringInputExpandable.displayName = "StringInputExpandable";

StringInputExpandable.defaultProps = {
  value: "",
  onChange: () => {},
  type: "text",
  required: false,
};

StringInputExpandable.propTypes = {
  className: PropTypes.string,
  value: PropTypes.string,
  type: PropTypes.string,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  onChange: PropTypes.func
};

export default StringInputExpandable;