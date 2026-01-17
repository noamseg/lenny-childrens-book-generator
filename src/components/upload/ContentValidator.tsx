'use client';

import { TranscriptValidationResult } from '@/types';
import { Card } from '@/components/ui';

interface ContentValidatorProps {
  validationResult: TranscriptValidationResult;
}

export default function ContentValidator({
  validationResult,
}: ContentValidatorProps) {
  const { isValid, wordCount, errors, warnings } = validationResult;

  return (
    <Card
      variant={isValid ? 'default' : 'outlined'}
      className={isValid ? 'border-2 border-green-200' : 'border-2 border-red-200'}
    >
      {/* Status header */}
      <div className="flex items-center gap-3 mb-4">
        {isValid ? (
          <>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-green-900">
                Content Validated
              </h3>
              <p className="text-sm text-green-700">
                Your transcript is ready to use
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-red-900">Validation Failed</h3>
              <p className="text-sm text-red-700">
                Please fix the issues below
              </p>
            </div>
          </>
        )}
      </div>

      {/* Stats */}
      {wordCount !== undefined && (
        <div className="flex gap-4 mb-4 p-3 bg-gray-50 rounded-xl">
          <div>
            <p className="text-sm text-gray-500">Word Count</p>
            <p className="text-lg font-semibold text-gray-900">
              {wordCount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Estimated Pages</p>
            <p className="text-lg font-semibold text-gray-900">
              {Math.min(10, Math.max(5, Math.floor(wordCount / 200)))}
            </p>
          </div>
        </div>
      )}

      {/* Errors */}
      {errors && errors.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-red-900 mb-2">Errors:</h4>
          <ul className="space-y-1">
            {errors.map((error, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-red-700"
              >
                <span className="text-red-500 mt-0.5">*</span>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div>
          <h4 className="font-medium text-amber-900 mb-2">Warnings:</h4>
          <ul className="space-y-1">
            {warnings.map((warning, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-amber-700"
              >
                <span className="text-amber-500 mt-0.5">!</span>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
