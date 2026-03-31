import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ShareModal } from '../components/ShareModal';
import { useAuth } from '../providers/AuthProvider';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const Subscribe = () => {
  const [email, setEmail] = useState('');
  const [linkSent, setLinkSent] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, configured, loading: authLoading } = useAuth();
  const from = (location.state as { from?: string })?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // If Supabase isn't configured yet, keep a graceful local fallback
    if (!configured || !isSupabaseConfigured || !supabase) {
      try {
        localStorage.setItem('yro-subscribed', 'true');
      } catch (_) {}
      setLinkSent(true);
      return;
    }

    setSendingLink(true);
    try {
      const emailTrimmed = email.trim().toLowerCase();
      const appUrl =
        (import.meta.env.VITE_APP_URL as string | undefined) ??
        window.location.origin;

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: emailTrimmed,
        options: {
          emailRedirectTo: `${appUrl}/subscribe`,
        },
      });
      if (otpError) throw otpError;
      // After the user clicks the email link, they'll be logged in and we'll upsert below.
      setLinkSent(true);
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to send login link.';
      if (msg.toLowerCase().includes('rate limit')) {
        setError('Too many login emails sent. Please wait about an hour and try again, or try /admin if you’re already signed in.');
      } else {
        setError(msg);
      }
    } finally {
      setSendingLink(false);
    }
  };

  // If user is logged in on this page, ensure they're subscribed in DB.
  React.useEffect(() => {
    const run = async () => {
      if (!configured || !supabase || !user) return;
      try {
        const emailValue = user.email ?? email.trim().toLowerCase();
        if (!emailValue) return;
        const { error: upsertError } = await supabase.from('newsletter_subscribers').upsert(
          {
            user_id: user.id,
            email: emailValue,
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null,
          },
          { onConflict: 'user_id' },
        );
        if (upsertError) throw upsertError;
      } catch (_) {
        setError('Signed in, but we could not confirm your subscription yet. Please try again in a moment.');
      }
    };
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, user]);

  const handleMaybeLater = () => {
    navigate(from);
  };

  // Show success state when: (a) user just submitted, or (b) user landed here after magic link (session exists)
  const showSuccess = linkSent || Boolean(user);

  // Wait for auth to finish loading before deciding; avoids showing form before session from magic link is detected
  if (configured && authLoading) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <div className="flex-grow bg-gray-50/80 flex items-center justify-center">
          <p className="text-gray-500">Signing you in…</p>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <div className="flex-grow bg-gray-50/80 flex flex-col items-center justify-center px-4 py-16">
          <div className="w-full max-w-md text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {configured && !user ? "Check your email" : "Spread the word"}
            </h1>
            <p className="text-gray-600 mb-8">
              {configured && !user
                ? "We sent you a sign-in link. Click it to finish signing in and unlock likes, comments, and shares."
                : "If you want to help Youth Research Office even more, share your reason for subscribing."}
            </p>
            {configured && !user && (
              <p className="text-xs text-gray-500 mb-6">
                If you haven't clicked the email link yet, check your inbox to complete login.
              </p>
            )}
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            <button
              onClick={() => setShowShareModal(true)}
              disabled={configured && !user}
              className="w-full px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors mb-4"
            >
              Share
            </button>
            <button
              onClick={handleMaybeLater}
              className="text-gray-700 hover:text-black hover:underline text-sm"
            >
              Maybe later
            </button>
          </div>
        </div>
        <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <div className="flex-grow bg-gray-50/80 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">
          What's your email?
        </h1>

        <form onSubmit={handleSubmit} className="flex gap-0 mb-6">
          <input
            type="email"
            placeholder="Type your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-3 border border-gray-200 rounded-l-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400"
          />
          <button
            type="submit"
            disabled={sendingLink}
            className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-r-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sendingLink ? 'Sending…' : 'Subscribe'}
          </button>
        </form>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {configured && (
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            We’ll email you a login link. Clicking it will sign you in and subscribe you to new-post notifications.
          </p>
        )}

        <p className="text-xs text-gray-500 leading-relaxed mt-6">
          By submitting, you agree to our{' '}
          <a href="#" className="underline hover:text-gray-700">Terms of Use</a>, our{' '}
          <a href="#" className="underline hover:text-gray-700">Privacy Policy</a> and our{' '}
          <a href="#" className="underline hover:text-gray-700">Information collection notice</a>.
        </p>
      </div>
      </div>
    </div>
  );
};
