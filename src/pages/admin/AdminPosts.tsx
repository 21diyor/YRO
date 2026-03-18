import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { useAuth } from "@/providers/AuthProvider"
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient"

type PostRow = {
  id: string
  title: string
  status: "draft" | "published"
  published_at: string | null
  updated_at: string
}

export function AdminPosts() {
  const nav = useNavigate()
  const { configured, user, loading: authLoading } = useAuth()
  const [loading, setLoading] = React.useState(true)
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [roleError, setRoleError] = React.useState<string | null>(null)
  const [posts, setPosts] = React.useState<PostRow[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const run = async () => {
      setRoleError(null)
      if (!configured || !isSupabaseConfigured || !supabase) {
        setError("Supabase is not configured.")
        setLoading(false)
        return
      }
      if (!user) {
        setLoading(false)
        return
      }

      const roleRes = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle()
      if (roleRes.error) {
        setRoleError(roleRes.error.message)
        setIsAdmin(false)
        setLoading(false)
        return
      }
      const ok = roleRes.data?.role === "admin"
      setIsAdmin(ok)
      if (!ok) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("posts")
        .select("id,title,status,published_at,updated_at")
        .order("updated_at", { ascending: false })
      if (error) setError(error.message)
      setPosts((data as PostRow[]) ?? [])
      setLoading(false)
    }
    void run()
  }, [configured, user])

  const createDraft = async () => {
    if (!supabase || !user) return
    setError(null)
    const { data, error } = await supabase
      .from("posts")
      .insert({
        title: "Untitled post",
        summary: "",
        content: "",
        status: "draft",
        author_id: user.id,
      })
      .select("id")
      .single()
    if (error) {
      setError(error.message)
      return
    }
    nav(`/admin/posts/${data.id}`)
  }

  const deletePost = async (postId: string, title: string) => {
    if (!supabase) return
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    setError(null)
    setDeletingId(postId)
    const { error } = await supabase.from("posts").delete().eq("id", postId)
    setDeletingId(null)
    if (error) {
      setError(error.message)
      return
    }
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-sm text-gray-600">Loading…</div>
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="max-w-md text-center">
            <h1 className="text-xl font-bold mb-2">Admin</h1>
            <p className="text-sm text-gray-600 mb-6">
              Please sign in by subscribing with your email first.
            </p>
            <Link to="/subscribe" className="text-accent hover:underline">
              Go to Subscribe
            </Link>
          </div>
        </main>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="max-w-lg text-center">
            <h1 className="text-xl font-bold mb-2">Access denied</h1>
            {roleError && (
              <p className="text-sm text-red-600 mb-3 font-mono">
                DB error: {roleError}
              </p>
            )}
            <p className="text-sm text-gray-600 mb-4">
              Your account isn't marked as admin in <code className="bg-gray-100 px-1 rounded">user_roles</code>.
            </p>
            <p className="text-xs text-gray-500 mb-2">Your user ID:</p>
            <code className="block text-xs bg-gray-100 p-3 rounded mb-4 break-all font-mono">
              {user.id}
            </code>
            <p className="text-xs text-gray-600 text-left mb-1">
              Run both blocks in Supabase Dashboard → SQL Editor (in order):
            </p>
            <pre className="mt-2 text-left text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto mb-3">
{`-- 1) Add you as admin
insert into public.user_roles (user_id, role)
values ('${user.id}', 'admin')
on conflict (user_id) do update set role = 'admin';

-- 2) Allow reading your own role (fixes RLS)
drop policy if exists "roles_admin_select" on public.user_roles;
drop policy if exists "roles_select_own" on public.user_roles;
create policy "roles_select_own"
on public.user_roles for select to authenticated
using (user_id = auth.uid());`}
            </pre>
            <p className="text-xs text-gray-500">
              Then refresh this page or sign out and sign in again.
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Admin posts</h1>
              <p className="text-sm text-gray-600 mt-1">
                Create drafts and publish to notify subscribers.
              </p>
              <p className="text-xs text-gray-400 mt-1 font-mono" title="This ID must exist in user_roles for RLS to allow new posts">
                Logged in as: {user.id}
              </p>
            </div>
            <button
              onClick={createDraft}
              className="bg-accent text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              New post
            </button>
          </div>

          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

          <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white">
            {posts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <Link to={`/admin/posts/${p.id}`} className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 truncate">{p.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {p.status.toUpperCase()}
                    {p.published_at ? ` • Published ${new Date(p.published_at).toLocaleString()}` : ""}
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/posts/${p.id}`}
                    className="text-sm text-gray-500 hover:text-black"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      deletePost(p.id, p.title)
                    }}
                    disabled={deletingId === p.id}
                    className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    {deletingId === p.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-gray-600">
                No posts yet.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

