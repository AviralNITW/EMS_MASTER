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
    <div className="flex justify-between items-start w-full gap-4">
      <div>
        <h1 className='text-xl sm:text-2xl font-medium'>
          Hello <br />
          <span className='text-2xl sm:text-3xl font-semibold'>{displayName} 👋</span>
        </h1>
      </div>
      <button 
        onClick={handleLogout}
        className="bg-red-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-red-700 transition-colors shadow-md mt-2 text-sm sm:text-base flex-shrink-0"
      >
        Logout
      </button>
    </div>
  );
};

export default Header;