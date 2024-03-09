import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button } from '../inputs/Button';
import useUpload from '../assets/useUpload';
import { InfoTooltip } from '../layout/Tooltip';

let nextId = 0;

export const FileInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const StyledInput = styled.input`
  opacity: 0;
  position: absolute;
`;

function FileUploader({ label, hint = "", onUpload, showSelectedFile, source, multiple, accepts }) {
  const [id] = useState(`file-input-${nextId++}`);
  const [filename, setFilename] = useState('');
  const upload = useUpload({ source, multiple, accepts });

  const handleFileChange = async (e) => {
    const files = e.target.files;
    setFilename(files[0].name);
    const uploadedAssets = await upload(files);

    if (uploadedAssets && uploadedAssets.length > 0) {
      onUpload(uploadedAssets[0].url);
    }
  };

  return (
    <InfoTooltip info={hint}>
      <FileInputContainer>
        <Button as="label" htmlFor={id}>
          {label}
        </Button>
        <StyledInput id={id} type="file" onChange={handleFileChange} />
        {showSelectedFile && <span>{filename ? filename : "No File chosen"}</span>}
      </FileInputContainer>
    </InfoTooltip>
  );
}

FileUploader.propTypes = {
  label: PropTypes.string.isRequired,
  onUpload: PropTypes.func.isRequired,
  showSelectedFile: PropTypes.bool,
  source: PropTypes.object.isRequired,
  multiple: PropTypes.bool,
  accepts: PropTypes.arrayOf(PropTypes.string)
};

FileUploader.defaultProps = {
  label: "Upload...",
  showSelectedFile: false,
  multiple: false,
  accepts: [".glb", ".gltf"]
};

export default FileUploader;