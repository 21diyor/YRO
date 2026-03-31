import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

const LOCAL_SUBSCRIBED_KEY = "yro-subscribed";
function getLocalSubscribed() {
  try {
    return localStorage.getItem(LOCAL_SUBSCRIBED_KEY) === "true";
  } catch {
    return false;
  }
}

export function useSubscriptionStatus() {
  const { configured, user } = useAuth();
  const [subscribed, setSubscribed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const run = async () => {
      // Local fallback when Supabase isn't configured (e.g. missing env vars in production).
      if (!configured || !isSupabaseConfigured || !supabase) {
        setSubscribed(getLocalSubscribed());
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
  const { subscribed, loading, configured } = useSubscriptionStatus();

  return React.useCallback(
    (fn?: () => void) => {
      // Avoid redirect loops while subscription status is still being fetched.
      if (loading) return false;
      if (subscribed) {
        fn?.();
        return true;
      }
      // When Supabase isn't configured, we still allow local subscribe flow to work,
      // but if the user isn't subscribed yet, route them to /subscribe.
      navigate("/subscribe", { state: { from: pathname, mode: configured ? "db" : "local" } });
      return false;
    },
    [configured, loading, navigate, pathname, subscribed],
  );
}

