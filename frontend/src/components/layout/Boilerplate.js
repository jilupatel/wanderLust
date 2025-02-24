import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import "../../index.css"
import "../styles/ListingPage.css"

const Boilerplate = ({ children }) => {
  return (
    <div>
      <Navbar />
      <div className="container" style={{ boxShadow: 'none' }}>{children}</div>
      {/* <Footer /> */}
    </div>
  );
};

export default Boilerplate;