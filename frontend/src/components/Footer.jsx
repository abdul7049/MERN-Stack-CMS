import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 shadow-md p-4 text-center">
      <p className="text-gray-800">&copy; {new Date().getFullYear()} My Application. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
