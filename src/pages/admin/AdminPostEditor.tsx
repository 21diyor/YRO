import React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { useAuth } from "@/providers/AuthProvider"
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient"

type PostRow = {
  id: string
  title: string
  summary: string
  content: string
  category: string | null
  cover_image_url: string | null
  status: "draft" | "published"
  published_at: string | null
}

export function AdminPostEditor() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const { configured, user, loading: authLoading } = useAuth()
  const [loading, setLoading] = React.useState(true)
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [info, setInfo] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [uploadingImage, setUploadingImage] = React.useState(false)
  const [post, setPost] = React.useState<PostRow | null>(null)

  React.useEffect(() => {
    const run = async () => {
      if (!id) {
        setError("Missing post id.")
        setLoading(false)
        return
      }
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
      const ok = roleRes.data?.role === "admin"
      setIsAdmin(ok)
      if (!ok) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("posts")
        .select("id,title,summary,content,category,cover_image_url,status,published_at")
        .eq("id", id)
        .maybeSingle()
      if (error) setError(error.message)
      setPost((data as PostRow) ?? null)
      setLoading(false)
    }
    void run()
  }, [configured, id, user])

  const update = (patch: Partial<PostRow>) => {
    setPost((p) => (p ? { ...p, ...patch } : p))
  }

  const save = async () => {
    if (!supabase || !post) return
    setSaving(true)
    setError(null)
    setInfo(null)
    const { error } = await supabase
      .from("posts")
      .update({
        title: post.title,
        summary: post.summary,
        content: post.content,
        category: post.category,
        cover_image_url: post.cover_image_url,
      })
      .eq("id", post.id)
    if (error) setError(error.message)
    setSaving(false)
  }

  const publish = async () => {
    if (!supabase || !post) return
    setSaving(true)
    setError(null)
    setInfo(null)

    // Save latest edits first
    const saveRes = await supabase
      .from("posts")
      .update({
        title: post.title,
        summary: post.summary,
        content: post.content,
        category: post.category,
        cover_image_url: post.cover_image_url,
      })
      .eq("id", post.id)
    if (saveRes.error) {
      setError(saveRes.error.message)
      setSaving(false)
      return
    }

    const now = new Date().toISOString()
    const { error } = await supabase
      .from("posts")
      .update({
        status: "published",
        published_at: post.published_at ?? now,
      })
      .eq("id", post.id)
    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    // Best-effort: invoke edge function if deployed.
    try {
      const res = await supabase.functions.invoke("send-post-notification", {
        body: { post_id: post.id },
      })
      if (res.error) {
        setInfo(
          "Post published, but email function failed (likely not deployed yet).",
        )
      } else {
        setInfo("Post published and notification emails have been triggered.")
      }
    } catch (_) {
      setInfo("Post published. Deploy edge functions to send emails.")
    }

    setPost({ ...post, status: "published", published_at: post.published_at ?? now })
    setSaving(false)
  }

  const uploadCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !supabase || !post) return
    const maxMb = 5
    if (file.size > maxMb * 1024 * 1024) {
      setError(`Image must be under ${maxMb} MB.`)
      return
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const path = `covers/${post.id}/${Date.now()}.${ext}`
    setError(null)
    setUploadingImage(true)
    const { error } = await supabase.storage
      .from("post-images")
      .upload(path, file, { contentType: file.type, upsert: true })
    setUploadingImage(false)
    e.target.value = ""
    if (error) {
      setError(error.message)
      return
    }
    const { data } = supabase.storage.from("post-images").getPublicUrl(path)
    update({ cover_image_url: data.publicUrl })
  }

  const deletePost = async () => {
    if (!supabase || !post) return
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return
    setError(null)
    setDeleting(true)
    const { error } = await supabase.from("posts").delete().eq("id", post.id)
    setDeleting(false)
    if (error) {
      setError(error.message)
      return
    }
    nav("/admin")
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
          <div className="max-w-md text-center">
            <h1 className="text-xl font-bold mb-2">Access denied</h1>
            <p className="text-sm text-gray-600">
              Your account isn’t marked as admin in `user_roles`.
            </p>
          </div>
        </main>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-sm text-gray-600">Post not found.</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <Link to="/admin" className="text-sm text-gray-600 hover:text-black">
                ← Back to posts
              </Link>
              <div className="mt-2 text-xs text-gray-500">
                {post.status.toUpperCase()}
                {post.published_at ? ` • Published ${new Date(post.published_at).toLocaleString()}` : ""}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-2 rounded-md border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
              >
                Save
              </button>
              <button
                onClick={publish}
                disabled={saving || post.status === "published"}
                className="bg-accent text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-60"
              >
                Publish
              </button>
            </div>
          </div>

          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
          {info && <div className="mb-4 text-sm text-gray-700">{info}</div>}

          <div className="grid grid-cols-1 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Title</span>
              <input
                value={post.title}
                onChange={(e) => update({ title: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Category</span>
              <input
                value={post.category ?? ""}
                onChange={(e) => update({ category: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                placeholder="e.g. Education"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Cover image</span>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <label className="cursor-pointer px-3 py-2 rounded-md border border-gray-200 text-sm font-medium hover:bg-gray-50">
                  {uploadingImage ? "Uploading…" : "Upload image"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="sr-only"
                    disabled={uploadingImage}
                    onChange={uploadCoverImage}
                  />
                </label>
                <span className="text-xs text-gray-500">or paste URL below (max 5 MB)</span>
              </div>
              <input
                value={post.cover_image_url ?? ""}
                onChange={(e) => update({ cover_image_url: e.target.value })}
                className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                placeholder="https://… or upload above"
              />
              {post.cover_image_url && (
                <img
                  src={post.cover_image_url}
                  alt="Cover preview"
                  className="mt-2 h-32 w-auto object-cover rounded-md border border-gray-200"
                />
              )}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Summary</span>
              <textarea
                value={post.summary}
                onChange={(e) => update({ summary: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                rows={3}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Content</span>
              <textarea
                value={post.content}
                onChange={(e) => update({ content: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                rows={16}
              />
            </label>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={deletePost}
                disabled={deleting || saving}
                className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete post"}
              </button>
              <button
                onClick={() => nav(`/post/${post.id}`)}
                className="px-4 py-2 rounded-md border border-gray-200 text-sm font-medium hover:bg-gray-50"
              >
                Preview
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

