import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        borderBottom: '1px solid #eaeaea',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff'
      }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: '#000' }}>
            My Blog
          </Link>
          <Link href="/" style={{ textDecoration: 'none', color: '#666' }}>
            Home
          </Link>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {loading ? (
            <span>Loading...</span>
          ) : user ? (
            <>
              <span style={{ color: '#666' }}>
                Welcome, {user.author?.display_name || user.email}
              </span>
              <Link href="/blog/dashboard" style={{ textDecoration: 'none', color: '#666' }}>
                My Posts
              </Link>
              <Link href="/blog/comments" style={{ textDecoration: 'none', color: '#666' }}>
                Comments
              </Link>
              <Link href="/blog/new" style={{ textDecoration: 'none', color: '#0070f3' }}>
                New Post
              </Link>
              <button
                onClick={() => logout()}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #eaeaea',
                  borderRadius: '5px',
                  backgroundColor: '#fff',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={{ textDecoration: 'none', color: '#0070f3' }}>
                Login
              </Link>
              <Link href="/auth/signup" style={{ textDecoration: 'none', color: '#0070f3' }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>

      <footer style={{
        borderTop: '1px solid #eaeaea',
        padding: '2rem',
        textAlign: 'center',
        color: '#666'
      }}>
        My Blog - Powered by Next.js and Supabase
      </footer>
    </div>
  );
}
