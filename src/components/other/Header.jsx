import React from 'react';

const Header = ({ changeUser }) => {
  let displayName = 'User';
  const loggedInUser = localStorage.getItem('loggedInUser');
  
  if (loggedInUser) {
    try {
      const user = JSON.parse(loggedInUser);
      if (user.role === 'admin') {
        displayName = 'Admin';
      } else if (user.role === 'employee' && user.data && user.data.firstName) {
        displayName = user.data.firstName;
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }

  const handleLogout = () => {
    if (changeUser) {
      changeUser('');
    }
  };

  return (
    <div className="flex justify-between items-start w-full">
      <div>
        <h1 className='text-2xl font-medium'>
          Hello <br />
          <span className='text-3xl font-semibold'>{displayName} 👋</span>
        </h1>
      </div>
      <button 
        onClick={handleLogout}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-md mt-2"
      >
        Logout
      </button>
    </div>
  );
};

export default Header;