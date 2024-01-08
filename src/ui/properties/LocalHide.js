import React, { useRef, useEffect } from 'react';
import { Eye } from "styled-icons/fa-solid/Eye";
import { EyeSlash } from "styled-icons/fa-solid/EyeSlash";

// Toggle a single property, display as an Eye icon or EyeSlash icon
const LocalHide = ({ value, updateVis }) => {
  const eyeRef = useRef(null);

  useEffect(() => {
    if (eyeRef.current) {
      eyeRef.current.style.color = value ? "white" : "gray";
    }
  }, [value]);

  const toggle = () => {
    // Call the passed function with the new value
    updateVis(!value);
  };

  return (
    <div 
      ref={eyeRef} 
      onClick={toggle} 
      style={{ 
        cursor: 'pointer', 
        marginLeft: '0.6em'
      }}
    >
      {value ? <Eye size="1em" /> : <EyeSlash size="1em" />}
    </div>
  );
}

export default LocalHide;
