'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuthStore } from '@/stores/authStore';
import type { LoginData } from '@/lib/api/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, error: authError, isLoading, clearError } = useAuthStore();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    clearError();
    setIsSubmitting(true);

    try {
      await login(formData);
      router.push('/');
    } catch (err: any) {
      setError(err.detail || authError || 'Failed to login. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-[var(--foreground)]">
            Welcome back
          </h1>
          <p className="text-[var(--foreground)] opacity-70">
            Sign in to your account to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-[var(--notion-red-bg)] border border-[var(--notion-red-border)] text-[var(--notion-red-text)] text-sm">
              {error}
            </div>
          )}

          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            autoComplete="email"
          />

          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            autoComplete="current-password"
          />

          <Button type="submit" isLoading={isSubmitting || isLoading} className="w-full">
            Sign in
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[var(--foreground)] opacity-70">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-[var(--notion-blue-text)] font-medium hover:text-[var(--notion-blue-text-hover)] transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

