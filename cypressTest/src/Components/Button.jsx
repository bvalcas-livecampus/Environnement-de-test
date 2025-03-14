// Composant Button.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ label, onClick }) => {
  return <button onClick={onClick}>{label}</button>;
};

Button.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export default Button;