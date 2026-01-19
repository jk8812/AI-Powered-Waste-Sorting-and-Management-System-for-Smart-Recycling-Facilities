import React from 'react';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom'; // 1. Import Link
import logo from './assets/logo2.png'; 

export function Navbar() {
  return (
    <nav className="bg-white border-b-2 border-black px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      {/* Clicking the logo also takes you HOME */}
      <Link to="/" className="rounded-lg w-40 h-14 flex items-center justify-center overflow-hidden">
        <img src={logo} alt="System Logo" className="w-full h-full object-contain" />
      </Link>

      <div className="hidden md:flex items-center gap-6">
        {/* 2. Changed buttons to Link tags */}
        <Link to="/" className="cssbuttons-io">
          <span>HOME</span>
        </Link>
        
        <Link to="/detect" className="cssbuttons-io">
          <span>MAIN</span>
        </Link>

        <button className="cssbuttons-io">
          <span>CONTACT US</span>
        </button>
      </div>

      <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center cursor-pointer hover:bg-gray-50">
        <User className="w-8 h-8 text-black" strokeWidth={1.5} />
      </div>
    </nav>
  );
}