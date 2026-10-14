import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="poultry-footer mt-auto py-4">
      <div className="container text-center">
        <p className="mb-1 text-light fw-semibold">
          🐔 Poultry Farm Management System &copy; {new Date().getFullYear()}
        </p>
        <small className="text-light-50">
          Empowering sustainable poultry operations with smart farm management.
        </small>
      </div>
    </footer>
  );
};

export default Footer;
