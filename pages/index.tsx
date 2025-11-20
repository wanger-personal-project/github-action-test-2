import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageShell } from '@/components/ui/page-shell';
import { StatCard } from '@/components/ui/stat-card';

interface Author {
  id: string;
  username: string;
  display_name: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  cover_image_url?: string;
  published_at: string;
  view_count: number;
  author: Author;
}

const featureList = [
  {
    title: 'Edge analytics',
    description: 'Supabase + Redis keep view and like counts live.',
  },
  {
    title: 'Creator-friendly UI',
    description: 'A tailored dashboard for drafts, comments, and releases.',
  },
  {
    title: 'Secure auth',
    description: 'Supabase Auth ensures readers and authors stay protected.',
  },
];

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/posts?page=1&limit=6&status=published`);
        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json();
        setPosts(data.posts);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <Layout>
      <PageShell className="space-y-10">
        <section className="rounded-3xl border border-border/50 bg-gradient-to-br from-white via-white to-muted/50 p-8 shadow-xl shadow-muted/40">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <Badge variant="outline" className="text-xs uppercase tracking-[0.4em]">
                FlowPress
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                Craft thoughtful stories and track every heartbeat of engagement.
              </h1>
              <p className="text-base text-muted-foreground">
                Built with Next.js, Supabase, and Vercel Edge Functions, this blog surfaces a modern writing experience for indie publishers.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/blog/new">Start writing</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/posts">Browse posts</Link>
                </Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <StatCard label="Writers" value="1" description="Personal studio" />
              <StatCard label="Stories" value={posts.length || 0} description="Latest releases" />
              <StatCard label="Stack" value="Next.js + Supabase" description="Edge ready" className="md:col-span-2" />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {featureList.map((feature) => (
            <Card key={feature.title} className="border border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Latest</p>
              <h2 className="text-2xl font-semibold tracking-tight">Featured posts</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/posts">View all</Link>
            </Button>
          </div>
          {loading && <p className="text-muted-foreground">Loading posts…</p>}
          {error && <p className="text-destructive">{error}</p>}
          {!loading && !error && (
            <div className="grid gap-6 md:grid-cols-2">
              {posts.map((post) => (
                <Card key={post.id} className="border border-border/70 shadow-sm transition hover:-translate-y-1">
                  {post.cover_image_url && (
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="h-48 w-full rounded-t-2xl object-cover"
                    />
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <span>{post.author.display_name}</span>
                      <span>•</span>
                      <span>{formatDate(post.published_at)}</span>
                    </div>
                    <CardTitle className="text-xl">
                      <Link href={`/blog/${post.slug}`} className="hover:underline">
                        {post.title}
                      </Link>
                    </CardTitle>
                    {post.excerpt && <CardDescription>{post.excerpt}</CardDescription>}
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{post.view_count} views</span>
                    <Link href={`/blog/${post.slug}`} className="text-foreground underline-offset-4 hover:underline">
                      Read story →
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </PageShell>
    </Layout>
  );
}
