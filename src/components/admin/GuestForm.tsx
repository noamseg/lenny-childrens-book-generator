'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input } from '@/components/ui';
import { LennyGuest, CreateGuestInput } from '@/types/lenny';

interface GuestFormProps {
  guest?: LennyGuest;
  mode: 'create' | 'edit';
}

export default function GuestForm({ guest, mode }: GuestFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<CreateGuestInput>({
    name: guest?.name || '',
    title: guest?.title || '',
    company: guest?.company || '',
    bio: guest?.bio || '',
    photoUrl: guest?.photoUrl || '',
    linkedIn: guest?.linkedIn || '',
    twitter: guest?.twitter || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const url = mode === 'create'
        ? '/api/admin/guests'
        : `/api/admin/guests/${guest?.id}`;

      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save guest');
      }

      router.push('/admin/guests');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-2xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Guest's full name"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., CEO"
              required
            />
            <Input
              label="Company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g., Stripe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Brief bio about the guest..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
              required
            />
          </div>

          <Input
            label="Photo URL"
            name="photoUrl"
            value={formData.photoUrl}
            onChange={handleChange}
            placeholder="https://..."
            helperText="URL to the guest's headshot image"
            required
          />

          {formData.photoUrl && (
            <div className="flex justify-center">
              <img
                src={formData.photoUrl}
                alt="Guest preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="LinkedIn (optional)"
              name="linkedIn"
              value={formData.linkedIn}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/..."
            />
            <Input
              label="Twitter (optional)"
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              placeholder="@handle"
            />
          </div>
        </div>

        <div className="mt-8 flex gap-4 justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : mode === 'create' ? 'Create Guest' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </form>
  );
}
