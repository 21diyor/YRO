import React from 'react';
import { X, Link2, Mail, Bookmark, MoreHorizontal } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Share Youth Research Office</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex flex-col items-center text-center">
              <img
                src="/Logo.png"
                alt="Youth Research Office"
                className="w-14 h-14 mb-3 object-contain"
              />
              <h4 className="font-bold text-gray-900 text-lg">Youth Research Office</h4>
              <p className="text-gray-500 text-sm mt-1">@youthresearchoffice</p>
              <p className="text-gray-500 text-sm mt-2">
                Insights for policymakers and entrepreneurs creating the future of Uzbekistan.
              </p>
              <p className="text-gray-400 text-xs mt-4 pt-4 border-t border-gray-200">
                Join our community
              </p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Link2 size={20} className="text-gray-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">Copy link</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-lg font-bold text-[#1877F2]">f</span>
              </div>
              <span className="text-xs font-medium text-gray-700">Facebook</span>
            </button>
            <a
              href="mailto:?subject=Youth Research Office&body=Check out Youth Research Office"
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Mail size={20} className="text-gray-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">Email</span>
            </a>
            <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Bookmark size={20} className="text-gray-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">Notes</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <MoreHorizontal size={20} className="text-gray-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">More</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
