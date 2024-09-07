import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';



const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); // Check if token exists

  const handleLogout = async () => {
      try {
          // Make a request to the logout endpoint
          await axios.get('http://localhost:4000/api/v1/logout', {}, {
              withCredentials: true
          });

          // Clear the token and user ID from local storage
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          localStorage.removeItem('userRole');

          // Redirect to login page
          navigate('/login');
          toast.success('Logged out successfully!');
      } catch (error) {
          console.error('Logout failed:', error);
          toast.error('Logout failed!');
      }
  };

  return (
      <nav className="bg-gray-800 p-4">
          <div className="container mx-auto flex justify-between items-center">
              <Link to="/" className="text-white text-lg font-semibold">Home</Link>
              <div>
                  {!token ? (
                      <>
                          <Link to="/login" className="text-white px-4">Login</Link>
                          <Link to="/signup" className="text-white px-4">Sign Up</Link>
                      </>
                  ) : (
                      <>
                          
                          <button
                              onClick={handleLogout}
                              className="text-white px-4 py-2 bg-red-500 rounded hover:bg-red-600"
                          >
                              Logout
                          </button>
                      </>
                  )}
              </div>
          </div>
      </nav>
  );
};

export default Header;
