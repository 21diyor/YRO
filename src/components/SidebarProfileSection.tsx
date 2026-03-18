import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const SUBSCRIBED_KEY = 'yro-subscribed';

export const isSubscribed = () => {
  try {
    return localStorage.getItem(SUBSCRIBED_KEY) === 'true';
  } catch {
    return false;
  }
};

interface SubscribeBlockProps {
  fromPath: string;
}

export const SubscribeBlock: React.FC<SubscribeBlockProps> = ({ fromPath }) => {
  const { configured, user, loading } = useAuth();
  const [dbSubscribed, setDbSubscribed] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const run = async () => {
      if (!configured || !isSupabaseConfigured || !supabase) {
        setDbSubscribed(null);
        return;
      }
      if (!user) {
        setDbSubscribed(false);
        return;
      }
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('unsubscribed_at')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) {
        setDbSubscribed(false);
        return;
      }
      setDbSubscribed(Boolean(data && data.unsubscribed_at == null));
    };
    void run();
  }, [configured, user]);

  const subscribed = configured ? (dbSubscribed ?? false) : isSubscribed();
  if (subscribed) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-stone-100/80 text-gray-700 border border-gray-200/80 w-fit">
        <Check size={18} className="text-gray-600 shrink-0" />
        <span className="font-medium text-sm">Subscribed</span>
      </div>
    );
  }
  return (
    <div className="flex gap-0">
      <input
        type="email"
        placeholder="Type your email..."
        className="flex-grow bg-gray-50 border border-gray-200 rounded-l px-4 py-2 text-sm focus:outline-none focus:border-gray-400"
      />
      <Link
        to="/subscribe"
        state={{ from: fromPath }}
        className="bg-accent text-white px-4 py-2 rounded-r text-sm font-medium hover:bg-accent-hover transition-colors flex items-center"
      >
        {configured && loading ? '…' : 'Subscribe'}
      </Link>
    </div>
  );
};

interface SidebarProfileSectionProps {
  fromPath: string;
}

export const SidebarProfileSection: React.FC<SidebarProfileSectionProps> = ({ fromPath }) => {
  return (
    <div className="space-y-4">
      <img src="/Logo.png" alt="Youth Research Office" className="h-14 w-auto object-contain" />
      <h2 className="text-lg font-bold">Youth Research Office</h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        Insights for policymakers and entrepreneurs creating the future of Uzbekistan.
      </p>
      <SubscribeBlock fromPath={fromPath} />
    </div>
  );
};
