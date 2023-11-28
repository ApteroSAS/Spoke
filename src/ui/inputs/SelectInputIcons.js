import React from "react";
import PropTypes from "prop-types";
import Select, { components } from "react-select";
import CreatableSelect from "react-select/creatable";

// Dynamically import all SVG icons in the icons folder
const iconsContext = require.context('./icons', false, /\.svg$/);

// Create a mapping object from file names (without extension) to the imported modules
const iconMap = iconsContext.keys().reduce((icons, filePath) => {
  // Extract the original file name without extension
  const iconName = filePath.replace('./', '').replace('.svg', '');
  // Map the original file name to the bundled path
  icons[iconName] = iconsContext(filePath);
  return icons;
}, {});

// Export map for use in the Preview
export { iconMap };

const iconStyle = {
  marginRight: '10px',
  height: '20px',
  filter: "brightness(0) invert(1)",
};

const staticStyle = {
  container: base => ({
    ...base,
    width: "100%",
    maxWidth: "200px"
  }),
  control: (base, { isDisabled }) => ({
    ...base,
    backgroundColor: isDisabled ? "#222222" : "black",
    minHeight: "24px",
    border: "1px solid #5D646C",
    cursor: "pointer"
  }),
  input: (base, { isDisabled }) => ({
    ...base,
    margin: "0px",
    color: isDisabled ? "grey" : "white"
  }),
  dropdownIndicator: base => ({
    ...base,
    padding: "0 4px 0 0"
  }),
  clearIndicator: base => ({
    ...base,
    padding: "0",
    width: "16px",
    height: "16px",
    alignItems: "center",
    paddingTop: "1px"
  }),
  menu: base => ({
    ...base,
    borderRadius: "4px",
    border: "1px solid black",
    backgroundColor: "black",
    outline: "none",
    padding: "0",
    position: "absolute",
    top: "20px"
  }),
  menuList: base => ({
    ...base,
    padding: "0"
  }),
  option: (base, { isFocused }) => ({
    ...base,
    backgroundColor: isFocused ? "#006EFF" : "black",
    cursor: "pointer"
  }),
  singleValue: (base, { isDisabled }) => ({
    ...base,
    color: isDisabled ? "grey" : "white"
  }),
  multiValue: (base, { isDisabled }) => ({
    ...base,
    backgroundColor: isDisabled ? "grey" : "#006EFF"
  }),
  multiValueLabel: (base, { isDisabled }) => ({
    ...base,
    color: isDisabled ? "black" : "white"
  }),
  multiValueRemove: (base, { isFocused }) => ({
    ...base,
    color: isFocused ? "grey" : "white"
  })
};

// Custom Option component
const IconOption = props => {
  const { value, children } = props;
  const IconSrc = iconMap[value]; // Use the icon from the map

  return (
    <components.Option {...props}>
      {IconSrc && <img src={IconSrc} alt="" style={iconStyle} />}
      {children}
    </components.Option>
  );
};

export default function SelectInputIcons({
  value,
  options,
  onChange,
  placeholder,
  disabled,
  error,
  styles,
  creatable,
  ...rest
}) {
  const selectedOption = Array.isArray(value)
    ? value
    : options.find(o => {
        if (o === null) {
          return o;
        } else if (o.value && o.value.equals) {
          return o.value.equals(value);
        } else {
          return o.value === value;
        }
      }) || null;

  const dynamicStyle = {
    ...staticStyle,
    placeholder: (base, { isDisabled }) => ({
      ...base,
      color: isDisabled ? "grey" : error ? "red" : "white"
    }),
    ...styles
  };

  const Component = creatable ? CreatableSelect : Select;

  return (
    <Component
      {...rest}
      styles={dynamicStyle}
      value={selectedOption}
      components={{ 
        IndicatorSeparator: () => null,
        Option: IconOption // Use the custom Option component
      }}
      placeholder={placeholder}
      options={options}
      onChange={option => {
        if (Array.isArray(option)) {
          onChange(
            option.filter(item => {
              return item.value >= 0;
            })
          );
        } else {
          onChange(option && option.value, option);
        }
      }}
      isDisabled={disabled}
    />
  );
}

SelectInputIcons.defaultProps = {
  value: null,
  placeholder: "Select...",
  optionNotFoundPlaceholder: "Error",
  onChange: () => {}
};

SelectInputIcons.propTypes = {
  value: PropTypes.any,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any,
      label: PropTypes.string
    })
  ),
  styles: PropTypes.object,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  creatable: PropTypes.bool
};
