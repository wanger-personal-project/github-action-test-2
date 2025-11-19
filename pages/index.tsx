import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

interface Author {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
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

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts?page=${page}&limit=10&status=published`);
      if (!response.ok) throw new Error('Failed to fetch posts');

      const data = await response.json();
      setPosts(data.posts);
      setTotalPages(data.pagination.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Latest Posts</h1>

        {loading && <p>Loading posts...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {posts.map((post) => (
            <article
              key={post.id}
              style={{
                border: '1px solid #eaeaea',
                borderRadius: '8px',
                padding: '1.5rem',
                transition: 'box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div>
                  {post.cover_image_url && (
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '1rem' }}
                    />
                  )}
                  <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#0070f3' }}>
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p style={{ color: '#666', marginBottom: '1rem', lineHeight: '1.6' }}>
                      {post.excerpt}
                    </p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#888' }}>
                    <div>
                      By <strong>{post.author.display_name}</strong> • {formatDate(post.published_at)}
                    </div>
                    <div>{post.view_count} views</div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #eaeaea',
                borderRadius: '5px',
                backgroundColor: page === 1 ? '#f5f5f5' : '#fff',
                cursor: page === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            <span style={{ padding: '0.5rem 1rem' }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #eaeaea',
                borderRadius: '5px',
                backgroundColor: page === totalPages ? '#f5f5f5' : '#fff',
                cursor: page === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
