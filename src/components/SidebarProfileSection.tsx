import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useLanguage } from '../providers/LanguageProvider';
import { t } from '../lib/i18n';

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
  const { lang } = useLanguage();

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
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-stone-100/80 dark:bg-[#1e1e1e] text-gray-700 dark:text-[#c4c4c4] border border-gray-200/80 dark:border-[#2e2e2e] w-fit">
        <Check size={18} className="text-gray-600 dark:text-[#a0a0a0] shrink-0" />
        <span className="font-medium text-sm">{t(lang, "sidebar_subscribed")}</span>
      </div>
    );
  }
  return (
    <div className="flex gap-0">
      <input
        type="email"
        placeholder={t(lang, "sidebar_email_placeholder")}
        className="flex-grow bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#2e2e2e] dark:text-[#ededed] dark:placeholder-[#555555] rounded-l px-4 py-2 text-sm focus:outline-none focus:border-gray-400 dark:focus:border-[#444444]"
      />
      <Link
        to="/subscribe"
        state={{ from: fromPath }}
        className="bg-accent text-white px-4 py-2 rounded-r text-sm font-medium hover:bg-accent-hover transition-colors flex items-center"
      >
        {configured && loading ? '…' : t(lang, "sidebar_subscribe")}
      </Link>
    </div>
  );
};

interface SidebarProfileSectionProps {
  fromPath: string;
}

export const SidebarProfileSection: React.FC<SidebarProfileSectionProps> = ({ fromPath }) => {
  const { lang } = useLanguage();
  return (
    <div className="space-y-4">
      <img src="/Logo.png" alt="Youth Research Office" className="h-14 w-auto object-contain" />
      <h2 className="text-lg font-bold dark:text-[#ededed]">{t(lang, "sidebar_title")}</h2>
      <p className="text-sm text-gray-600 dark:text-[#a0a0a0] leading-relaxed">
        {t(lang, "sidebar_description")}
      </p>
      <SubscribeBlock fromPath={fromPath} />
    </div>
  );
};
