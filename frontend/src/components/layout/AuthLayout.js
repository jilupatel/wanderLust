import React from 'react';
import MainNavbar from './MainNavbar';
import Footer from './Footer';

const MainBoilerplate = ({ children }) => {
  return (
    <div>
      <MainNavbar />
      <div className="container">{children}</div>
      <Footer />
    </div>
  );
};

export default MainBoilerplate;