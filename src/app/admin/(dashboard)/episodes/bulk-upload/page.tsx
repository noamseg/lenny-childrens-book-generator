import Link from 'next/link';
import { BulkUploadWizard } from '@/components/admin/bulk-upload';

export default function BulkUploadPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/admin/episodes" className="hover:text-primary-600">
            Episodes
          </Link>
          <span>/</span>
          <span className="text-gray-900">Bulk Upload</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-gray-900">
          Bulk Upload Episodes
        </h1>
        <p className="text-gray-600 mt-1">
          Import multiple transcripts at once with AI-powered metadata extraction
        </p>
      </div>

      <BulkUploadWizard />
    </div>
  );
}
