import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import Boilerplate from './components/Boilerplate';
import Sidebar from "./components/layout/Sidebar.js";
import ListingList from "./pages/ListingList.js";
import Navbar from "./components/layout/Navbar.js";
import ListingDetail from "./components/Modules/ListingDetail.js";
import GalleryPage  from "./components/Modules/GalleryPage.js";
import ListingForm from "./pages/ListingForm.js";
import Signup from "./pages/Signup.js";
import Login from "./pages/Login.js";
import MainBoilerplate from "./components/layout/MainBoilerplate.js";
import Boilerplate from "./components/layout/Boilerplate.js";
import Logout from "./pages/Logout.js";
import AdminListings from "./Admin/AdminListings.js";
import ReservationForm from "./pages/ReservationForm.js";
import ReservationTable from "./Admin/ReservationTable.js";
import ReservationConfirmation from "./pages/ReservationConfirmation.js";
import UserAdminPanel from "./Admin/UserAdminPanel";
import UserLogin from "./pages/UserLogin.js";
import UserListings from "./owner/UserListings.js";
import ReservationDetails from "./owner/ReservationDetails.js";
import Profile from "./Admin/Profile.js";
import ProfileAuth from "./guard/ProfileAuth.js";
import ResetPasswordRequest from "./Admin/ResetPasswordRequest.js";
import ResetPassword from "./Admin/ResetPassword.js";
import AdminLogin from "./Admin/AdminLogin.js";
import ProtectedRoute from "./guard/ProtectedAdmin.js";
import UpdateInformation from "./Admin/UpdateInformation.js";
import FeaturePage from "./Admin/FeaturePage.js";
import HostProfileForm from "./pages/HostProfileForm.js";
import HostingTable from "./Admin/HostingTable.js";
import HostingForm from "./Admin/HostingForm.js";
import AdminListingList from "./Admin/AdminListingList.js";
import HelpCenter from "./pages/HelpCenter.js";
import UploadImage from "./Admin/UploadImage.js";


// const helpCenterData = require("../../backend/helpCenterData.json");


const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("adminLoggedIn") === "true"
  );

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      {/* <MainBoilerplate> */}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isAuthenticated={isAuthenticated}
      />
      <Routes>
        {/* <Route path="/admin/listings" element={<AdminListings />} />
          <Route path="/admin/reservations" element={<ReservationTable />} />
          <Route path="/admin/user/login" element={<UserAdminPanel />} /> */}
        <Route path="/help-center" element={<HelpCenter />} />
        <Route
          path="/admin/login"
          element={<AdminLogin setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route path="/listings/:id/gallery" element={<GalleryPage />} />
        <Route path="/admin/host-table" element={<HostingTable />} />
        <Route path="/admin/host-profile" element={<HostingForm />} />
        <Route
          path="/admin/listings"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminListings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reservations"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ReservationTable />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/user/login"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <UserAdminPanel />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<ListingList />} />
        <Route path="/listings" element={<ListingList />} />
        <Route path="/admin" element={<AdminListingList />} />
        <Route path="/listings/new" element={<ListingForm isEdit={false} />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/host-profile/:username/:listingId" element={<HostProfileForm />} />

        <Route
          path="/listings/:id/edit"
          element={<ListingForm isEdit={true} />}
        />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/reserve/:id" element={<ReservationForm />} />
        <Route
          path="/reservation-confirmation"
          element={<ReservationConfirmation />}
        />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/listings" element={<UserListings />} />
        <Route
          path="/user/listings/:listingId"
          element={<ReservationDetails />}
        />
        <Route
          path="/profile"
          element={
            <ProfileAuth>
              <Profile />
            </ProfileAuth>
          }
        />
        <Route
          path="/reset-password-request"
          element={<ResetPasswordRequest />}
        />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/user/update/information"
          element={<UpdateInformation />}
        />
        <Route path="/admin/upload/image" element={<UploadImage />} />
        <Route path="/admin/feature/authentication" element={<FeaturePage />} />
      </Routes>
      {/* </MainBoilerplate> */}
    </Router>
  );
};

export default App;
