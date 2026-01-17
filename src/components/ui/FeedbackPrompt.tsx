'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';

interface FeedbackPromptProps {
  isOpen: boolean;
  onClose: () => void;
  bookId?: string;
  childName?: string;
}

const HAPPINESS_OPTIONS = [
  { value: 1, emoji: '😞', label: 'Not great' },
  { value: 2, emoji: '😐', label: 'It was okay' },
  { value: 3, emoji: '🙂', label: 'Good' },
  { value: 4, emoji: '😊', label: 'Really good!' },
  { value: 5, emoji: '🤩', label: 'Amazing!' },
];

export default function FeedbackPrompt({
  isOpen,
  onClose,
  bookId,
  childName,
}: FeedbackPromptProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [hasSeenPrompt, setHasSeenPrompt] = useState(false);

  // Check if user has already provided feedback this session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const feedbackGiven = sessionStorage.getItem('lenny-feedback-given');
      if (feedbackGiven) {
        setHasSeenPrompt(true);
      }
    }
  }, []);

  const handleSubmit = () => {
    if (selectedRating === null) return;

    // In production, this would send to an analytics service
    console.log('Feedback submitted:', {
      bookId,
      rating: selectedRating,
      timestamp: new Date().toISOString(),
    });

    // Mark feedback as given for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('lenny-feedback-given', 'true');
    }

    setSubmitted(true);
  };

  const handleClose = () => {
    // Mark as seen even if they dismiss without rating
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('lenny-feedback-given', 'true');
    }
    onClose();
  };

  // Don't show if already provided feedback this session
  if (hasSeenPrompt) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="sm">
      {submitted ? (
        <div className="text-center py-4">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">💜</span>
          </div>
          <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
            Thank You!
          </h3>
          <p className="text-gray-600 mb-4">
            Your feedback helps us create even more magical experiences.
          </p>
          <Button onClick={handleClose}>Done</Button>
        </div>
      ) : (
        <div className="text-center">
          {/* Header with sparkles */}
          <div className="relative mb-6">
            <span className="absolute -top-2 left-1/4 text-lg animate-pulse">✨</span>
            <span className="absolute -top-1 right-1/4 text-lg animate-pulse animation-delay-200">⭐</span>
            <h3 className="font-display text-xl font-bold text-gray-900">
              How was your experience?
            </h3>
          </div>

          <p className="text-gray-600 mb-6 text-sm">
            {childName
              ? `We hope ${childName} loves their new book!`
              : 'We hope you enjoyed creating your book!'}
            <br />
            One quick rating helps us improve.
          </p>

          {/* Happiness rating */}
          <div className="flex justify-center gap-2 mb-6">
            {HAPPINESS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedRating(option.value)}
                className={`
                  flex flex-col items-center p-3 rounded-xl transition-all
                  ${
                    selectedRating === option.value
                      ? 'bg-primary-100 scale-110 shadow-playful'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }
                `}
                aria-label={option.label}
              >
                <span className="text-3xl mb-1">{option.emoji}</span>
                <span
                  className={`text-xs font-medium ${
                    selectedRating === option.value
                      ? 'text-primary-700'
                      : 'text-gray-500'
                  }`}
                >
                  {option.label}
                </span>
              </button>
            ))}
          </div>

          {/* Selected rating highlight */}
          {selectedRating !== null && (
            <p className="text-sm text-primary-600 mb-4 animate-fadeIn">
              {selectedRating >= 4
                ? "We're so glad you enjoyed it! 🎉"
                : selectedRating >= 3
                ? 'Thanks for the feedback!'
                : "We'll work hard to do better! 💪"}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <Button variant="ghost" onClick={handleClose}>
              Maybe Later
            </Button>
            <Button onClick={handleSubmit} disabled={selectedRating === null}>
              Submit
            </Button>
          </div>

          {/* Privacy note */}
          <p className="text-xs text-gray-400 mt-4">
            Anonymous feedback only - we don&apos;t store personal info.
          </p>
        </div>
      )}
    </Modal>
  );
}
