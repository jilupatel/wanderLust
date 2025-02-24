import React from 'react';
import MainNavbar from './MainNavbar';
import Footer from './Footer';
import "../../index.css"
import "../styles/ListingPage.css"

const MainBoilerplate = ({ children }) => {
  return (
    <div>
      <MainNavbar />
      <div className="container" style={{ boxShadow: 'none' }}>{children}</div>
      {/* <Footer /> */}
    </div>
  );
};

export default MainBoilerplate;