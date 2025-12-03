'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { signup, login, getCurrentUser, type SignupData } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { login: setAuthUser } = useAuth();
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    password: '',
    name: '',
  });
  const [errors, setErrors] = useState<Partial<SignupData>>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<SignupData> = {};

    if (!formData.name.trim() || formData.name.length < 1) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Create account
      await signup(formData);
      
      // Automatically log in the user
      await login({
        email: formData.email,
        password: formData.password,
      });
      
      // Get user data
      const userData = await getCurrentUser();
      setAuthUser(userData);
      router.push('/');
    } catch (err: any) {
      setError(err.detail || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
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
            Create your account
          </h1>
          <p className="text-[var(--foreground)] opacity-70">
            Get started with your free account today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-[var(--notion-red-bg)] border border-[var(--notion-red-border)] text-[var(--notion-red-text)] text-sm">
              {error}
            </div>
          )}

          <Input
            id="name"
            type="text"
            label="Full Name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            error={errors.name}
            required
            autoComplete="name"
          />

          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            error={errors.email}
            required
            autoComplete="email"
          />

          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            error={errors.password}
            required
            autoComplete="new-password"
            minLength={8}
          />

          <Button type="submit" isLoading={isLoading} className="w-full">
            Create account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[var(--foreground)] opacity-70">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[var(--foreground)] font-medium hover:opacity-80 transition-opacity"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

