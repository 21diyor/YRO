import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

export function useSubscriptionStatus() {
  const { configured, user } = useAuth();
  const [subscribed, setSubscribed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const run = async () => {
      if (!configured || !isSupabaseConfigured || !supabase) {
        setSubscribed(false);
        setLoading(false);
        setError(null);
        return;
      }
      if (!user) {
        setSubscribed(false);
        setLoading(false);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("newsletter_subscribers")
        .select("unsubscribed_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (fetchError) {
        setSubscribed(false);
        setLoading(false);
        setError(fetchError.message ?? "Failed to check subscription status.");
        return;
      }
      setSubscribed(Boolean(data && (data as { unsubscribed_at: string | null }).unsubscribed_at == null));
      setLoading(false);
    };
    void run();
  }, [configured, user?.id]);

  return { subscribed, loading, configured, user, error };
}

/** Returns a function that either runs `fn` (if subscribed) or navigates to `/subscribe`. */
export function useRequireSubscription() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { subscribed, loading } = useSubscriptionStatus();

  return React.useCallback(
    (fn?: () => void) => {
      // Avoid redirect loops while subscription status is still being fetched.
      if (loading) return false;
      if (subscribed) {
        fn?.();
        return true;
      }
      navigate("/subscribe", { state: { from: pathname } });
      return false;
    },
    [loading, navigate, pathname, subscribed],
  );
}

