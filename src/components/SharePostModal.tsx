import React, { useState } from "react";
import { Share2, Link2, Check, X } from "lucide-react";

interface SharePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  onCopy?: () => void;
  onNativeShare?: () => void;
  shareCount?: number;
}

export function SharePostModal({
  isOpen,
  onClose,
  title,
  url,
  onCopy,
  onNativeShare,
  shareCount = 0,
}: SharePostModalProps) {
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {}).then(() => onNativeShare?.());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Share2 size={20} className="text-accent" />
            Share this post
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{title}</p>
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 mb-4">
          <input
            type="text"
            readOnly
            value={url}
            className="flex-1 min-w-0 bg-transparent text-sm text-gray-700 truncate focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            {copied ? <Check size={18} className="text-green-600" /> : <Link2 size={18} />}
            {copied ? "Copied!" : "Copy link"}
          </button>
          {canNativeShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors text-sm font-medium"
            >
              <Share2 size={18} />
              Share
            </button>
          )}
        </div>
        {shareCount > 0 && (
          <p className="mt-3 text-xs text-gray-500">
            This post has been shared {shareCount} time{shareCount !== 1 ? "s" : ""}.
          </p>
        )}
      </div>
    </div>
  );
}
