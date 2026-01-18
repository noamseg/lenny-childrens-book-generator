'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/layout';
import { Button, Card, Input, ProgressBar } from '@/components/ui';
import { TranscriptUploader } from '@/components/upload';
import { useTranscript, useBookGeneration, useBookDraft } from '@/hooks';
import { ILLUSTRATION_STYLES, STORY_THEMES, AGE_OPTIONS } from '@/constants';
import { IllustrationStyle, LennyEpisode } from '@/types';

type Step = 'upload' | 'customize' | 'generate' | 'complete';

function CreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const episodeId = searchParams.get('episode');

  const [step, setStep] = useState<Step>('upload');
  const [draft, setDraft, clearDraft] = useBookDraft();

  // Episode state
  const [episode, setEpisode] = useState<LennyEpisode | null>(null);
  const [episodeTranscript, setEpisodeTranscript] = useState<string | null>(null);
  const [episodeLoading, setEpisodeLoading] = useState(false);
  const [episodeError, setEpisodeError] = useState<string | null>(null);

  // Form state
  const [childName, setChildName] = useState(draft.childName || '');
  const [childAge, setChildAge] = useState<number | undefined>(draft.childAge);
  const [theme, setTheme] = useState(draft.theme || '');
  const [illustrationStyle, setIllustrationStyle] = useState<IllustrationStyle>(
    (draft.illustrationStyle as IllustrationStyle) || 'storybook'
  );

  // Animation state for name celebration
  const [showNameCelebration, setShowNameCelebration] = useState(false);
  const [nameJustEntered, setNameJustEntered] = useState(false);

  // Trigger celebration when name is first entered
  useEffect(() => {
    if (childName.trim().length >= 2 && !nameJustEntered) {
      setShowNameCelebration(true);
      setNameJustEntered(true);
      const timer = setTimeout(() => setShowNameCelebration(false), 2000);
      return () => clearTimeout(timer);
    }
    if (!childName.trim()) {
      setNameJustEntered(false);
    }
  }, [childName, nameJustEntered]);

  // Fetch episode data if episodeId is provided
  useEffect(() => {
    if (!episodeId) return;

    setEpisodeLoading(true);
    setEpisodeError(null);

    fetch(`/api/lenny/episodes/${episodeId}`)
      .then(res => {
        if (!res.ok) throw new Error('Episode not found');
        return res.json();
      })
      .then(data => {
        setEpisode(data.episode);
        setEpisodeTranscript(data.transcript);
        // Skip to customize step if we have a transcript
        if (data.transcript) {
          setStep('customize');
        }
      })
      .catch(err => {
        setEpisodeError(err.message);
      })
      .finally(() => {
        setEpisodeLoading(false);
      });
  }, [episodeId]);

  // Hooks
  const transcript = useTranscript();
  const bookGeneration = useBookGeneration({
    onComplete: (book) => {
      // Increment books generated count for this episode
      if (episodeId) {
        fetch(`/api/lenny/episodes/${episodeId}`, { method: 'POST' }).catch(console.error);
      }
      clearDraft();
      router.push(`/preview/${book.id}`);
    },
    onError: (error) => {
      console.error('Book generation failed:', error);
    },
  });

  // Handle transcript upload
  const handleTranscriptUpload = async (file: File) => {
    try {
      await transcript.uploadFile(file);
    } catch {
      // Error handled in hook
    }
  };

  const handleTranscriptText = async (text: string) => {
    try {
      await transcript.submitText(text);
    } catch {
      // Error handled in hook
    }
  };

  // Get the active transcript content
  const getTranscriptContent = () => {
    if (episodeTranscript) return episodeTranscript;
    return transcript.transcriptContent;
  };

  // Check if we have a valid transcript
  const hasValidTranscript = () => {
    if (episodeTranscript) return true;
    return transcript.hasValidTranscript;
  };

  // Progress to next step
  const goToCustomize = () => {
    if (hasValidTranscript()) {
      setStep('customize');
    }
  };

  const goToGenerate = () => {
    if (childName.trim()) {
      const transcriptContent = getTranscriptContent();
      setDraft({
        childName,
        childAge,
        theme,
        illustrationStyle,
        transcriptContent,
      });
      setStep('generate');
      startGeneration();
    }
  };

  const startGeneration = async () => {
    const transcriptContent = getTranscriptContent();
    if (!transcriptContent) return;

    // Build additional context from episode info
    let additionalContext = '';
    if (episode) {
      additionalContext = `Based on Lenny's Podcast conversation with ${episode.guest?.name} (${episode.guest?.title} at ${episode.guest?.company}). Topics covered: ${episode.topics.join(', ')}.`;
    }

    try {
      await bookGeneration.generateBook({
        childName,
        childAge,
        theme,
        illustrationStyle,
        transcriptContent,
        additionalContext,
      });
    } catch {
      // Error handled in hook
    }
  };

  // Calculate overall progress
  const getOverallProgress = () => {
    if (step === 'upload') return hasValidTranscript() ? 33 : 0;
    if (step === 'customize') return 50;
    if (step === 'generate') {
      const { progress } = bookGeneration;
      if (progress.status === 'processing') {
        const stepProgress: Record<string, number> = {
          validating: 55,
          'generating-story': 70,
          'generating-images': 85,
          'compiling-pdf': 95,
          done: 100,
        };
        return stepProgress[progress.currentStep] || 50;
      }
      return progress.status === 'completed' ? 100 : 50;
    }
    return 100;
  };

  // Clear episode and go back to upload
  const handleStartFresh = () => {
    setEpisode(null);
    setEpisodeTranscript(null);
    transcript.reset();
    setStep('upload');
    router.replace('/create');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 py-12">
      <Container size="md">
        {/* Episode banner */}
        {episode && (
          <div className="mb-6">
            <Card className="bg-gradient-to-r from-primary-50 to-purple-50 border-primary-200">
              <div className="flex items-center gap-4">
                {episode.guest?.photoUrl && (
                  <img
                    src={episode.guest.photoUrl}
                    alt={episode.guest.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-primary-600 font-medium">
                    Creating from Lenny&apos;s Podcast Episode #{episode.episodeNumber}
                  </p>
                  <p className="font-display font-bold text-gray-900 truncate">
                    {episode.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    with {episode.guest?.name}
                  </p>
                </div>
                <button
                  onClick={handleStartFresh}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Use different transcript
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Progress indicator */}
        <div className="mb-8">
          <ProgressBar
            progress={getOverallProgress()}
            label={
              step === 'upload'
                ? 'Step 1: Upload Transcript'
                : step === 'customize'
                ? 'Step 2: Customize Your Book'
                : 'Step 3: Creating Your Book'
            }
            color="primary"
          />
        </div>

        {/* Loading episode */}
        {episodeLoading && (
          <div className="animate-fadeIn">
            <Card className="text-center py-12">
              <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading episode...</p>
            </Card>
          </div>
        )}

        {/* Episode error */}
        {episodeError && (
          <div className="animate-fadeIn">
            <Card className="text-center py-12">
              <span className="text-6xl block mb-4">😔</span>
              <h2 className="font-display text-2xl font-bold mb-2 text-red-600">
                Episode Not Found
              </h2>
              <p className="text-gray-600 mb-6">{episodeError}</p>
              <Link href="/discover">
                <Button variant="outline">Browse Episodes</Button>
              </Link>
            </Card>
          </div>
        )}

        {/* Step content */}
        {!episodeLoading && !episodeError && (
          <>
            {step === 'upload' && (
              <div className="animate-fadeIn">
                <div className="text-center mb-8">
                  <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
                    Start With Your Transcript
                  </h1>
                  <p className="text-gray-600 max-w-xl mx-auto">
                    Upload a podcast transcript or paste text from a family
                    conversation. This will become the inspiration for your
                    personalized story.
                  </p>
                  <Link
                    href="/discover"
                    className="inline-block mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Or browse Lenny&apos;s Podcast episodes →
                  </Link>
                </div>

                <TranscriptUploader
                  onUpload={handleTranscriptUpload}
                  onTextSubmit={handleTranscriptText}
                  isUploading={transcript.isLoading}
                  error={transcript.error}
                />

                {transcript.hasValidTranscript && (
                  <div className="mt-8 text-center animate-scaleIn">
                    <Card className="inline-block bg-green-50 border-2 border-green-200">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">✅</span>
                        <div className="text-left">
                          <p className="font-semibold text-green-900">
                            Transcript validated!
                          </p>
                          <p className="text-sm text-green-700">
                            {transcript.validationResult?.wordCount?.toLocaleString()}{' '}
                            words ready to transform
                          </p>
                        </div>
                      </div>
                    </Card>
                    <div className="mt-6">
                      <Button onClick={goToCustomize} size="lg">
                        Continue to Customize
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 'customize' && (
              <div className="animate-fadeIn">
                <div className="text-center mb-8">
                  <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
                    Customize Your Book
                  </h1>
                  <p className="text-gray-600">
                    Tell us about the star of the story
                  </p>
                </div>

                <Card className="max-w-xl mx-auto">
                  <div className="space-y-6">
                    {/* Child's name with celebration animation */}
                    <div className="relative">
                      <Input
                        label="Child's Name"
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        placeholder="Enter the child's name"
                        helperText="This will be the main character in the story"
                      />

                      {/* Name celebration animation */}
                      {showNameCelebration && (
                        <div className="absolute inset-0 pointer-events-none overflow-visible">
                          <span className="absolute -top-2 left-8 text-xl animate-float-up">✨</span>
                          <span className="absolute -top-4 left-1/3 text-2xl animate-float-up animation-delay-100">⭐</span>
                          <span className="absolute -top-2 left-1/2 text-xl animate-float-up animation-delay-200">🌟</span>
                          <span className="absolute -top-4 left-2/3 text-2xl animate-float-up animation-delay-300">✨</span>
                          <span className="absolute -top-2 right-8 text-xl animate-float-up animation-delay-400">⭐</span>
                          <div className="absolute -bottom-8 left-0 right-0 text-center">
                            <span className="inline-block px-4 py-1 bg-gradient-to-r from-primary-500 to-purple-500 text-white text-sm font-medium rounded-full animate-scaleIn shadow-playful">
                              {childName} is going on an adventure! 🚀
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Child's age */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Child&apos;s Age (optional)
                      </label>
                      <select
                        value={childAge || ''}
                        onChange={(e) =>
                          setChildAge(e.target.value ? parseInt(e.target.value) : undefined)
                        }
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                      >
                        <option value="">Select age</option>
                        {AGE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Theme selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Story Theme (optional)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {STORY_THEMES.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setTheme(theme === t.id ? '' : t.id)}
                            className={`p-3 rounded-xl border-2 text-center transition-all ${
                              theme === t.id
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span className="text-2xl block mb-1">{t.icon}</span>
                            <span className="text-xs font-medium">{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Illustration style */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Illustration Style
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ILLUSTRATION_STYLES.map((style) => (
                          <button
                            key={style.id}
                            onClick={() => setIllustrationStyle(style.id)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              illustrationStyle === style.id
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <p className="font-semibold text-gray-900">
                              {style.label}
                            </p>
                            <p className="text-sm text-gray-500">
                              {style.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-4 justify-end">
                    {!episode && (
                      <Button variant="ghost" onClick={() => setStep('upload')}>
                        Back
                      </Button>
                    )}
                    <Button
                      onClick={goToGenerate}
                      disabled={!childName.trim()}
                    >
                      Generate Book
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {step === 'generate' && (
              <div className="animate-fadeIn">
                <Card className="max-w-xl mx-auto text-center py-12">
                  {bookGeneration.isGenerating ? (
                    <>
                      <div className="relative w-32 h-32 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-purple-200 rounded-full animate-pulse" />
                        <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 border-r-purple-500 rounded-full animate-spin" />
                        <div className="absolute inset-4 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-4xl animate-bounce">
                            {bookGeneration.progress.currentStep === 'validating' && '🔍'}
                            {bookGeneration.progress.currentStep === 'generating-story' && '✨'}
                            {bookGeneration.progress.currentStep === 'generating-images' && '🎨'}
                            {bookGeneration.progress.currentStep === 'compiling-pdf' && '📚'}
                            {bookGeneration.progress.currentStep === 'done' && '🎉'}
                          </span>
                        </div>
                        <div className="absolute -top-2 -right-2 text-xl animate-ping">✨</div>
                        <div className="absolute -bottom-2 -left-2 text-xl animate-ping animation-delay-300">⭐</div>
                      </div>

                      <h2 className="font-display text-2xl font-bold mb-2 gradient-text">
                        Making Magic Happen...
                      </h2>

                      <p className="text-gray-600 mb-2">
                        {bookGeneration.progress.currentStep === 'validating' && 'Checking your transcript for the best story seeds...'}
                        {bookGeneration.progress.currentStep === 'generating-story' && `Writing ${childName}'s magical adventure...`}
                        {bookGeneration.progress.currentStep === 'generating-images' && 'Painting beautiful illustrations...'}
                        {bookGeneration.progress.currentStep === 'compiling-pdf' && 'Binding your book together...'}
                        {!['validating', 'generating-story', 'generating-images', 'compiling-pdf'].includes(bookGeneration.progress.currentStep) && 'Please wait...'}
                      </p>

                      <p className="text-sm text-purple-500 mb-6 italic">
                        {bookGeneration.progress.currentStep === 'generating-story' && (episode
                          ? `🎙️ Inspired by Lenny's conversation with ${episode.guest?.name}...`
                          : '🐛 Adding a friendly bug character just for fun...'
                        )}
                        {bookGeneration.progress.currentStep === 'generating-images' && '🎨 Every illustration is unique, just like your story!'}
                      </p>

                      <ProgressBar
                        progress={getOverallProgress()}
                        showPercentage={true}
                        color="primary"
                        animated
                      />

                      <p className="text-xs text-gray-400 mt-4">
                        This usually takes less than 2 minutes
                      </p>
                    </>
                  ) : bookGeneration.error ? (
                    <>
                      <span className="text-6xl mb-4 block">😔</span>
                      <h2 className="font-display text-2xl font-bold mb-2 text-red-600">
                        Oops! The Magic Fizzled
                      </h2>
                      <p className="text-gray-600 mb-6">
                        {bookGeneration.error.message}
                      </p>
                      <p className="text-sm text-gray-500 mb-6">
                        Don&apos;t worry - this happens sometimes. Let&apos;s try again!
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button variant="outline" onClick={() => setStep('customize')}>
                          Change Settings
                        </Button>
                        <Button onClick={startGeneration}>
                          Try Again ✨
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative w-24 h-24 mx-auto mb-4">
                        <span className="text-6xl block animate-bounce">🎉</span>
                        <span className="absolute -top-2 right-0 text-2xl animate-ping">✨</span>
                        <span className="absolute -bottom-2 left-0 text-2xl animate-ping animation-delay-200">⭐</span>
                      </div>
                      <h2 className="font-display text-2xl font-bold mb-2 gradient-text">
                        Your Book is Ready!
                      </h2>
                      <p className="text-gray-600">Redirecting to preview...</p>
                    </>
                  )}
                </Card>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CreatePageContent />
    </Suspense>
  );
}
