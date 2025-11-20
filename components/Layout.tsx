import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/posts", label: "Articles" },
  { href: "/about", label: "About" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-b from-white via-white to-muted/40">
        <div className="absolute inset-0 pointer-events-none opacity-50" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }} />
        <header className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-6">
            <Link href="/" className="text-2xl font-semibold tracking-tight text-slate-900">
              FlowPress
            </Link>
            <nav className="hidden gap-4 text-sm text-muted-foreground md:flex">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="md:hidden">
              {loading ? (
                <span className="text-sm text-muted-foreground">Loading...</span>
              ) : user ? (
                <Link
                  href="/blog/dashboard"
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            {loading ? (
              <span className="text-sm text-muted-foreground">Loading...</span>
            ) : user ? (
              <>
                <div className="text-left text-sm">
                  <p className="font-medium text-foreground">{user.author?.display_name || user.email}</p>
                  <p className="text-xs text-muted-foreground">Welcome back</p>
                </div>
                <Link href="/blog/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                  My Posts
                </Link>
                <Link href="/blog/comments" className="text-sm text-muted-foreground hover:text-foreground">
                  Comments
                </Link>
                <Button asChild>
                  <Link href="/blog/new">New Post</Link>
                </Button>
                <Button variant="outline" onClick={() => logout()}>
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex gap-3">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </header>
      </div>

      <main className="mx-auto w-full max-w-6xl px-6 py-10 lg:py-12">{children}</main>

      <footer className="border-t border-border bg-white/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} FlowPress. Crafted with Next.js & Supabase.</p>
          <div className="flex gap-3">
            <Link href="/posts" className="hover:text-foreground">
              Blog
            </Link>
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
            <Link href="https://github.com/your-username/my-nextra-blog" className="hover:text-foreground">
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
