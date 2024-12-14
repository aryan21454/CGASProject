
import React from 'react';

const Navbar = ({ searchQuery, setSearchQuery, handleSearch }) => {
  return (
    <div>
      <nav className="bg-black ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span onClick={()=>NavigationPreloadManager} className="text-xl text-white font-bold">DishDecode</span>
            </div>
            <div className="hidden md:flex space-x-4 items-center text-white">
              <a href="/" className="hover:bg-blue-600 px-3 py-2 rounded-md">
                Home
              </a>
              <a href="#upload" className="hover:bg-blue-600 px-3 py-2 rounded-md">
                Upload
              </a>
              <a href="#about" className="hover:bg-blue-600 px-3 py-2 rounded-md">
                About
              </a>
            </div>
            <div className="ml-4 flex items-center">
              <form onSubmit={handleSearch} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 rounded-lg text-black focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
