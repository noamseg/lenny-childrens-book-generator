'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';

interface OnboardingModalProps {
  onComplete: () => void;
}

const ONBOARDING_STEPS = [
  {
    icon: '📝',
    title: 'Upload Your Transcript',
    description:
      'Paste a podcast transcript or any conversation. We\'ll extract the magic from your words to create a unique story.',
  },
  {
    icon: '✨',
    title: 'Customize Your Book',
    description:
      'Add your child\'s name to make them the star! Choose an illustration style and theme that matches their personality.',
  },
  {
    icon: '🎨',
    title: 'Watch the Magic Happen',
    description:
      'Our AI creates a 10-page illustrated story with subtle tech jokes for parents and pure fun for kids.',
  },
  {
    icon: '📤',
    title: 'Share the Joy',
    description:
      'Download as a beautiful PDF or share directly with grandparents, friends, and family. Bedtime just got magical!',
  },
];

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('lenny-onboarding-complete');
    if (!hasSeenOnboarding) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('lenny-onboarding-complete', 'true');
    setIsOpen(false);
    onComplete();
  };

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleSkip} size="md">
      <div className="text-center">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-primary-500 w-6'
                  : index < currentStep
                  ? 'bg-primary-300'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
            <span className="text-4xl">{step.icon}</span>
          </div>
          <h2 className="font-display text-2xl font-bold mb-3 text-gray-900">
            {step.title}
          </h2>
          <p className="text-gray-600 max-w-sm mx-auto">{step.description}</p>
        </div>

        {/* Step indicator */}
        <p className="text-sm text-gray-400 mb-4">
          Step {currentStep + 1} of {ONBOARDING_STEPS.length}
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={handleSkip}>
            Skip
          </Button>
          <Button onClick={handleNext}>
            {isLastStep ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
