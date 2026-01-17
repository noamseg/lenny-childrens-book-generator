'use client';

import { useState } from 'react';
import Button from './Button';
import Modal from './Modal';

interface ReportButtonProps {
  bookId: string;
  pageNumber?: number;
}

const REPORT_REASONS = [
  { id: 'inappropriate', label: 'Inappropriate content' },
  { id: 'scary', label: 'Scary or disturbing imagery' },
  { id: 'offensive', label: 'Offensive language' },
  { id: 'quality', label: 'Poor quality images/text' },
  { id: 'other', label: 'Other concern' },
];

export default function ReportButton({ bookId, pageNumber }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setIsSubmitting(true);

    try {
      // In production, this would submit to an API
      // For MVP, we'll just log the report
      console.log('Content report submitted:', {
        bookId,
        pageNumber,
        reason: selectedReason,
        details,
        timestamp: new Date().toISOString(),
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset state after modal closes
    setTimeout(() => {
      setSelectedReason(null);
      setDetails('');
      setSubmitted(false);
    }, 300);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Report content"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
          />
        </svg>
        Report
      </button>

      <Modal isOpen={isOpen} onClose={handleClose} size="sm">
        {submitted ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
              Thank You
            </h3>
            <p className="text-gray-600 mb-6">
              Your report has been submitted. We take all concerns seriously and
              will review this content.
            </p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        ) : (
          <>
            <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
              Report Content
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Help us keep content safe and appropriate for children.
              {pageNumber && ` Reporting page ${pageNumber}.`}
            </p>

            {/* Reason selection */}
            <div className="space-y-2 mb-4">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason.id}
                  className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedReason === reason.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.id}
                    checked={selectedReason === reason.id}
                    onChange={() => setSelectedReason(reason.id)}
                    className="sr-only"
                  />
                  <span
                    className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                      selectedReason === reason.id
                        ? 'border-primary-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedReason === reason.id && (
                      <span className="w-2 h-2 rounded-full bg-primary-500" />
                    )}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {reason.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Additional details */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional details (optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Tell us more about your concern..."
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200
                  focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
                  focus:outline-none resize-none text-sm"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedReason}
                isLoading={isSubmitting}
              >
                Submit Report
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
