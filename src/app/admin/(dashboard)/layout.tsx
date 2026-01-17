import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/admin-auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect('/admin/login');
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}
