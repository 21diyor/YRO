import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

export function useSubscriptionStatus() {
  const { configured, user } = useAuth();
  const [subscribed, setSubscribed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const run = async () => {
      if (!configured || !isSupabaseConfigured || !supabase) {
        setSubscribed(false);
        setLoading(false);
        return;
      }
      if (!user) {
        setSubscribed(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("unsubscribed_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        setSubscribed(false);
        setLoading(false);
        return;
      }
      setSubscribed(Boolean(data && (data as { unsubscribed_at: string | null }).unsubscribed_at == null));
      setLoading(false);
    };
    void run();
  }, [configured, user?.id]);

  return { subscribed, loading, configured, user };
}

/** Returns a function that either runs `fn` (if subscribed) or navigates to `/subscribe`. */
export function useRequireSubscription() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { subscribed } = useSubscriptionStatus();

  return React.useCallback(
    (fn?: () => void) => {
      if (subscribed) {
        fn?.();
        return true;
      }
      navigate("/subscribe", { state: { from: pathname } });
      return false;
    },
    [navigate, pathname, subscribed],
  );
}

