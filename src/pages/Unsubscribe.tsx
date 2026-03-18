import React from "react"
import { Navbar } from "@/components/Navbar"
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient"

export function Unsubscribe() {
  const [status, setStatus] = React.useState<"idle" | "working" | "done" | "error">(
    "idle",
  )
  const [message, setMessage] = React.useState<string>("")

  React.useEffect(() => {
    const run = async () => {
      const url = new URL(window.location.href)
      const email = (url.searchParams.get("email") ?? "").trim().toLowerCase()
      if (!email) {
        setStatus("error")
        setMessage("Missing email parameter.")
        return
      }
      if (!isSupabaseConfigured || !supabase) {
        setStatus("error")
        setMessage("Supabase is not configured.")
        return
      }

      setStatus("working")
      try {
        const { error } = await supabase
          .from("newsletter_subscribers")
          .update({ unsubscribed_at: new Date().toISOString() })
          .eq("email", email)
        if (error) throw error
        setStatus("done")
        setMessage("You have been unsubscribed.")
      } catch (e: any) {
        setStatus("error")
        setMessage(e?.message ?? "Failed to unsubscribe.")
      }
    }
    void run()
  }, [])

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Unsubscribe</h1>
          <p className="text-sm text-gray-600 mb-6">
            {status === "working" ? "Working…" : message}
          </p>
          <a href="/" className="text-accent hover:underline text-sm">
            Return home
          </a>
        </div>
      </main>
    </div>
  )
}

