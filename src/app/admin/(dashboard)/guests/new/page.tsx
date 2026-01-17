import { GuestForm } from '@/components/admin';

export default function NewGuestPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900">
          Add New Guest
        </h1>
        <p className="text-gray-600 mt-1">
          Create a new podcast guest profile
        </p>
      </div>

      <GuestForm mode="create" />
    </div>
  );
}
