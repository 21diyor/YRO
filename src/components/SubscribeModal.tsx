import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const location = useLocation();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for subscription logic
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - dimmed and blurred */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <img
            src="/Logo.png"
            alt="Youth Research Office"
            className="w-14 h-14 mx-auto mb-4 object-contain rounded-full"
          />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Discover more from Youth Research Office
          </h2>
          <p className="text-gray-600 text-sm mb-2">
            Insights for policymakers and entrepreneurs creating the future of Uzbekistan.
          </p>
          <p className="text-gray-500 text-xs mb-6">
            Join our community of researchers and decision-makers.
          </p>

          <form onSubmit={handleSubmit} className="text-left">
            <input
              type="email"
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 mb-4"
            />
            <Link
              to="/subscribe"
              state={{ from: location.pathname }}
              onClick={onClose}
              className="block w-full bg-accent hover:bg-accent-hover text-white font-medium py-3 rounded-lg transition-colors text-center"
            >
              Subscribe
            </Link>
          </form>

          <p className="text-[11px] text-gray-500 mt-4 leading-relaxed">
            By subscribing, you agree to our Terms of Use, and acknowledge our Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};
