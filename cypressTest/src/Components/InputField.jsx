import React, { useState } from 'react';
import PropTypes from 'prop-types';

const InputField = ({ placeholder, onchange, value }) => {

  return (
    <div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onchange(e.target.value)}
      />
      <p>Value: {value}</p>
    </div>
  );
};

InputField.propTypes = {
  placeholder: PropTypes.string,
};

export default InputField;