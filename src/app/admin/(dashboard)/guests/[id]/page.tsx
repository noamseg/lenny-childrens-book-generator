import { notFound } from 'next/navigation';
import { GuestForm } from '@/components/admin';
import { getGuest } from '@/lib/lenny-data';

interface EditGuestPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGuestPage({ params }: EditGuestPageProps) {
  const { id } = await params;
  const guest = await getGuest(id);

  if (!guest) {
    notFound();
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900">
          Edit Guest
        </h1>
        <p className="text-gray-600 mt-1">
          {guest.name} - {guest.title} at {guest.company}
        </p>
      </div>

      <GuestForm guest={guest} mode="edit" />
    </div>
  );
}
