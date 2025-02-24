// UserAdminPanel.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/layout/Sidebar";
import MainNavbar from "../components/layout/MainNavbar";
import "../components/styles/Admin.css";

const UserAdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [editId, setEditId] = useState(null);
  const [editableUser, setEditableUser] = useState({});
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/user/login");
        setUsers(response.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleAddNewUser = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/user/login",
        newUser
      );
      setUsers([...users, response.data]);
      alert("User added successfully!");
      setNewUser({ username: "", email: "", password: "" });
      setIsAddFormVisible(false);
    } catch (err) {
      console.error("Error adding user:", err);
      alert("Failed to add user.");
    }
  };

  const handleEdit = (user) => {
    setEditId(user._id);
    setEditableUser({ ...user });
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/user/login/${id}`, editableUser);
      alert("User updated successfully!");
      setUsers(users.map((user) => (user._id === id ? editableUser : user)));
      setEditId(null);
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/user/login/${id}`);
      alert("User deleted successfully!");
      setUsers(users.filter((user) => user._id !== id));
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user.");
    }
  };

  return (
    <div>
      <MainNavbar />
      <Sidebar />

      <div className="container mt-4">
        <button className="btn btn-primary mb-3" onClick={() => setIsAddFormVisible(true)}>
          Add New User
        </button>

        {isAddFormVisible && (
          <div style={{marginTop: "20px"}} className="form-container">
            <h3>Add New User</h3>
            <div class="mb-3">
              <label for="Input1" class="form-label">
                Username
              </label>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              className="form-control"
                id="Input1"
                style={{borderColor: "black", width: "500px", marginLeft: "0px" }}
                required
              />
            </div>
            <div class="mb-3">
              <label for="Textarea1" class="form-label">
                Email
              </label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="form-control"
                id="Input1"
                style={{ width: "500px" }}
                required
              />
            </div>
            <div class="mb-3">
              <label for="Input1" class="form-label">
                Password
              </label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="form-control"
                id="Input1"
                style={{ width: "500px", marginLeft: "0px" }}
                required
              />
            </div>
            <button className="btn btn-success me-2" onClick={handleAddNewUser}>
              Save
            </button>
            <button className="btn btn-secondary" onClick={() => setIsAddFormVisible(false)}>
              Cancel
            </button>
          </div>
        )}

        <h2>User Management</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  {editId === user._id ? (
                    <input
                      type="text"
                      name="username"
                      value={editableUser.username}
                      onChange={(e) => setEditableUser({ ...editableUser, username: e.target.value })}
                    />
                  ) : (
                    user.username
                  )}
                </td>
                <td>
                  {editId === user._id ? (
                    <input
                      type="email"
                      name="email"
                      value={editableUser.email}
                      onChange={(e) => setEditableUser({ ...editableUser, email: e.target.value })}
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td>
                  {editId === user._id ? (
                    <button className="btn btn-success" onClick={() => handleSave(user._id)}>
                      Save
                    </button>
                  ) : (
                    <>
                      <button className="btn btn-warning" onClick={() => handleEdit(user)}>
                        Edit
                      </button>
                      <button className="btn btn-danger ms-2" onClick={() => handleDelete(user._id)}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="fixed-footer">
      <div className="footer">
      <div className="f-info">
        <div className="f-info-socials">
          <a href="#"><i className="fa-brands fa-square-facebook"></i></a>
          <a href="#"><i className="fa-brands fa-square-twitter"></i></a>
          <a href="#"><i className="fa-brands fa-square-instagram"></i></a>
          <a href="#"><i className="fa-brands fa-linkedin"></i></a>
        </div>
        <div>&copy; WanderLust Private Limited</div>
        <div className="f-info-links">
          <a href="/privacy">Privacy</a>
          <a href="/term">Term</a>
        </div>
      </div>
      </div>
    </footer>
    </div>
  );
};

export default UserAdminPanel;
