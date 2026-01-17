'use client';

import { useBulkUpload } from '@/hooks/useBulkUpload';
import { Card } from '@/components/ui';
import BulkFileDropZone from './BulkFileDropZone';
import AnalysisProgress from './AnalysisProgress';
import ReviewTable from './ReviewTable';
import ImportSummary from './ImportSummary';

export default function BulkUploadWizard() {
  const {
    items,
    phase,
    progress,
    importResult,
    error,
    addFiles,
    removeItem,
    clearItems,
    startAnalysis,
    cancelAnalysis,
    updateItem,
    importSelected,
    reset,
  } = useBulkUpload();

  // Phase indicator steps
  const steps = [
    { id: 'upload', label: 'Upload', icon: '📁' },
    { id: 'analyzing', label: 'Analyze', icon: '🤖' },
    { id: 'review', label: 'Review', icon: '✏️' },
    { id: 'complete', label: 'Import', icon: '✅' },
  ];

  const currentStepIndex = steps.findIndex(s =>
    s.id === phase || (phase === 'importing' && s.id === 'review')
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  index < currentStepIndex
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : index === currentStepIndex
                    ? 'bg-primary-100 border-primary-500 text-primary-700'
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }`}
              >
                {index < currentStepIndex ? '✓' : step.icon}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  index <= currentStepIndex ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-4 ${
                    index < currentStepIndex ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <p className="font-medium text-red-700">Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Phase Content */}
      {phase === 'upload' && (
        <BulkFileDropZone
          items={items}
          onAddFiles={addFiles}
          onRemoveItem={removeItem}
          onClear={clearItems}
          onStartAnalysis={startAnalysis}
        />
      )}

      {phase === 'analyzing' && (
        <AnalysisProgress
          items={items}
          progress={progress}
          onCancel={cancelAnalysis}
        />
      )}

      {(phase === 'review' || phase === 'importing') && (
        <>
          {phase === 'importing' && (
            <Card className="mb-6 text-center">
              <div className="text-4xl animate-pulse mb-4">📥</div>
              <h3 className="text-lg font-medium text-gray-900">
                Importing episodes...
              </h3>
            </Card>
          )}
          <ReviewTable
            items={items}
            onUpdateItem={updateItem}
            onImportSelected={importSelected}
            onBack={reset}
          />
        </>
      )}

      {phase === 'complete' && importResult && (
        <ImportSummary
          result={importResult}
          onStartOver={reset}
        />
      )}

      {/* Help Text */}
      {phase === 'upload' && items.length === 0 && (
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <h3 className="font-medium text-blue-700 mb-2">
            How Bulk Upload Works
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-600">
            <li>Drop or select your transcript .txt files</li>
            <li>Click &quot;Start Analysis&quot; to let AI extract episode metadata</li>
            <li>Review and edit the extracted data as needed</li>
            <li>Select episodes to import and click &quot;Import&quot;</li>
          </ol>
          <p className="mt-3 text-xs text-blue-500">
            Cost estimate: ~$0.02 per transcript using Claude Sonnet
          </p>
        </Card>
      )}
    </div>
  );
}
