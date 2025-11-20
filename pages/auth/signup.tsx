import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageShell } from '@/components/ui/page-shell';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate username format (lowercase, numbers, hyphens)
    if (!/^[a-z0-9-]+$/.test(username)) {
      setError('Username must contain only lowercase letters, numbers, and hyphens');
      setLoading(false);
      return;
    }

    try {
      await signup(email, password, username, displayName);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageShell className="flex min-h-[70vh] items-center justify-center">
        <Card className="w-full max-w-md border border-border/80 shadow-xl shadow-muted/60">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold tracking-tight">Join FlowPress</CardTitle>
            <CardDescription>Publish essays, manage drafts, and connect with your readers.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-xl border border-destructive/30 bg-red-50 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="writer@flowpress.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-muted-foreground">
                  Username
                </label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="alex-journal"
                  required
                />
                <p className="text-xs text-muted-foreground">Lowercase letters, numbers & hyphens only.</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="displayName" className="text-sm font-medium text-muted-foreground">
                  Display name
                </label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Alex Journal"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                <p className="text-xs text-muted-foreground">Minimum 6 characters.</p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </PageShell>
    </Layout>
  );
}
