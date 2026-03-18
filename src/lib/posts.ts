import * as React from "react"
import { isSupabaseConfigured, supabase, getStorageCoverUrl } from "@/lib/supabaseClient"
import { posts as localPosts, type FilterTab, type Post } from "@/data"

type DbPostRow = {
  id: string
  title: string
  summary: string
  content: string
  cover_image_url: string | null
  category: string | null
  published_at: string | null
}

function formatMonthYear(iso: string | null): string {
  if (!iso) return "Draft"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "Draft"
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(d)
}

function mapDbPostToUi(row: DbPostRow): Post {
  return {
    id: row.id,
    title: row.title,
    date: formatMonthYear(row.published_at),
    category: row.category ?? "Research",
    summary: row.summary,
    content: row.content,
    image: row.cover_image_url ?? getStorageCoverUrl("1.png"),
  }
}

export function filterPostsBySearch(list: Post[], query: string): Post[] {
  if (!query.trim()) return list;
  const q = query.trim().toLowerCase();
  return list.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      (p.summary && p.summary.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)),
  );
}

export function getFilteredPostsFromList(
  list: Post[],
  filter: FilterTab,
  excludeFeatured = false,
  searchQuery = "",
): Post[] {
  let out = filterPostsBySearch(list, searchQuery)
  if (excludeFeatured && out.length > 0) out = out.slice(1)

  // Date strings are Month YYYY in current UI; keep same logic.
  const MONTH_ORDER: Record<string, number> = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  }
  const parseDate = (dateStr: string): number => {
    const [month, year] = dateStr.split(" ")
    const m = MONTH_ORDER[month] ?? 0
    const y = parseInt(year || "0", 10)
    return y * 100 + m
  }

  switch (filter) {
    case "latest":
      return out.sort((a, b) => parseDate(b.date) - parseDate(a.date))
    case "top":
      return out.sort((a, b) => {
        const scoreA =
          (a.engagement?.likes ?? 0) +
          (a.engagement?.comments ?? 0) +
          (a.engagement?.reposts ?? 0)
        const scoreB =
          (b.engagement?.likes ?? 0) +
          (b.engagement?.comments ?? 0) +
          (b.engagement?.reposts ?? 0)
        return scoreB - scoreA
      })
    case "discussions":
      return out.sort(
        (a, b) => (b.engagement?.comments ?? 0) - (a.engagement?.comments ?? 0),
      )
    default:
      return out
  }
}

export function usePublishedPosts() {
  const [posts, setPosts] = React.useState<Post[]>(localPosts)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const run = async () => {
      if (!isSupabaseConfigured || !supabase) return
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from("posts")
        .select("id,title,summary,content,cover_image_url,category,published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      const mapped = (data as DbPostRow[]).map(mapDbPostToUi)
      // Only replace with DB data when we have published posts; otherwise keep local fallback
      setPosts(mapped.length > 0 ? mapped : localPosts)
      setLoading(false)
    }
    void run()
  }, [])

  return { posts, loading, error }
}

export function usePostById(id: string | undefined) {
  const [post, setPost] = React.useState<Post | null>(null)
  const [loading, setLoading] = React.useState<boolean>(false)

  React.useEffect(() => {
    if (!id) {
      setPost(null)
      return
    }
    // fallback first (instant)
    const local = localPosts.find((p) => p.id === id) ?? null
    setPost(local)

    const run = async () => {
      if (!isSupabaseConfigured || !supabase) return
      // Only query by id if it looks like a UUID (DB posts); slug-style ids are local-only
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id ?? "")
      if (!isUuid) return
      setLoading(true)
      try {
        const { data } = await supabase
          .from("posts")
          .select("id,title,summary,content,cover_image_url,category,published_at")
          .eq("id", id)
          .maybeSingle()
        if (data) setPost(mapDbPostToUi(data as DbPostRow))
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [id])

  return { post, loading }
}

