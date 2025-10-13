import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                {/* <span className="text-white font-bold text-sm">RE</span> */}
              </div>
              <span className="text-2xl font-bold">Vasudha</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted platform for property rentals. Connecting owners and tenants seamlessly.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">For Tenants</h3>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors duration-200">Find Properties</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">How it Works</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Rental Guide</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">For Owners</h3>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors duration-200">List Property</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Owner Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Pricing</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors duration-200">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p className="text-sm">&copy; 2025 Vasudha. All rights reserved. Capstone Project.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;