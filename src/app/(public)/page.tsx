'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout';
import { Button, Card, OnboardingModal } from '@/components/ui';
import { LennyEpisode } from '@/types/lenny';

export default function HomePage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [featuredEpisode, setFeaturedEpisode] = useState<LennyEpisode | null>(null);

  // Fetch featured episode
  useEffect(() => {
    fetch('/api/lenny/episodes')
      .then(res => res.json())
      .then(episodes => {
        if (episodes.length > 0) {
          setFeaturedEpisode(episodes[0]);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="relative">
      {/* Onboarding Modal */}
      <OnboardingModal onComplete={() => setShowOnboarding(false)} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-purple-50 py-20 lg:py-32">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 text-6xl opacity-20 animate-float" aria-hidden="true">
          📚
        </div>
        <div className="absolute top-20 right-20 text-4xl opacity-20 animate-float animation-delay-200" aria-hidden="true">
          ✨
        </div>
        <div className="absolute bottom-20 left-1/4 text-5xl opacity-20 animate-float animation-delay-500" aria-hidden="true">
          🎙️
        </div>

        <Container size="lg">
          <div className="text-center max-w-4xl mx-auto">
            {/* Lenny's Podcast badge */}
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span>🎙️</span>
              <span>Powered by Lenny's Podcast</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Turn Lenny's Podcast Episodes Into{' '}
              <span className="gradient-text">Magical Children&apos;s Books</span>
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
              Transform insights from your favorite product leaders into
              beautiful, personalized bedtime stories starring your child
              as the hero.
            </p>
            <p className="text-lg text-purple-600 mb-8 max-w-xl mx-auto font-medium">
              With subtle tech jokes that&apos;ll make you smile while the kids enjoy the adventure! 🐛✨
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/discover">
                <Button size="lg" className="w-full sm:w-auto">
                  Browse Episodes
                </Button>
              </Link>
              <Link href="/create">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Upload Your Own
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Episode Section */}
      {featuredEpisode && (
        <section className="py-16 bg-white">
          <Container>
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Latest Episode Ready to Transform
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Turn this episode into a magical story for your child
              </p>
            </div>

            <Card className="max-w-3xl mx-auto bg-gradient-to-r from-primary-50 to-purple-50 border-2 border-primary-100">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                {featuredEpisode.guest?.photoUrl && (
                  <img
                    src={featuredEpisode.guest.photoUrl}
                    alt={featuredEpisode.guest.name}
                    className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg"
                  />
                )}
                <div className="flex-1 text-center md:text-left">
                  <p className="text-sm text-primary-600 font-medium mb-1">
                    Episode #{featuredEpisode.episodeNumber}
                  </p>
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
                    {featuredEpisode.title}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    with <span className="font-semibold">{featuredEpisode.guest?.name}</span>
                    {featuredEpisode.guest?.company && (
                      <span> ({featuredEpisode.guest.title} at {featuredEpisode.guest.company})</span>
                    )}
                  </p>
                  {featuredEpisode.featuredQuote && (
                    <p className="text-gray-500 text-sm italic mt-2">
                      &ldquo;{featuredEpisode.featuredQuote}&rdquo;
                    </p>
                  )}
                </div>
                <Link href={`/create?episode=${featuredEpisode.id}`}>
                  <Button size="lg" className="whitespace-nowrap">
                    Create Book
                  </Button>
                </Link>
              </div>
            </Card>

            <div className="text-center mt-6">
              <Link
                href="/discover"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Browse all episodes →
              </Link>
            </div>
          </Container>
        </section>
      )}

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Create Magic in 3 Simple Steps
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From Lenny episode to bedtime keepsake in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="text-center card-hover">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎙️</span>
              </div>
              <div className="text-xs font-bold text-primary-500 mb-1">STEP 1</div>
              <h3 className="font-display text-lg font-bold mb-2">Choose Episode</h3>
              <p className="text-gray-600 text-sm">
                Pick a Lenny's Podcast episode or upload your own transcript
              </p>
            </Card>

            {/* Step 2 */}
            <Card className="text-center card-hover">
              <div className="w-14 h-14 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <div className="text-xs font-bold text-secondary-500 mb-1">STEP 2</div>
              <h3 className="font-display text-lg font-bold mb-2">Add Your Child</h3>
              <p className="text-gray-600 text-sm">
                Enter your child&apos;s name and pick an illustration style
              </p>
            </Card>

            {/* Step 3 */}
            <Card className="text-center card-hover">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <div className="text-xs font-bold text-purple-500 mb-1">STEP 3</div>
              <h3 className="font-display text-lg font-bold mb-2">Enjoy Your Book</h3>
              <p className="text-gray-600 text-sm">
                Download your personalized illustrated story
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Features Section - Tech Parent Focus */}
      <section className="py-20 bg-white">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                Built for Product Parents
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Stories Kids Love, With Jokes Tech Parents Get
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🎙️</span>
                  <div>
                    <strong className="text-gray-900">Lenny's Podcast Magic</strong>
                    <p className="text-gray-600">
                      Transform wisdom from product leaders like Brian Chesky, Claire Hughes Johnson, and more
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🐛</span>
                  <div>
                    <strong className="text-gray-900">Hidden Tech Easter Eggs</strong>
                    <p className="text-gray-600">
                      Enjoy subtle references to debugging, the cloud, sprints, and more - kids love them too!
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">👶</span>
                  <div>
                    <strong className="text-gray-900">Truly Personalized</strong>
                    <p className="text-gray-600">
                      Your child&apos;s name appears throughout as the hero of their own adventure
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🎨</span>
                  <div>
                    <strong className="text-gray-900">5 Illustration Styles</strong>
                    <p className="text-gray-600">
                      From watercolor to cartoon - pick the perfect look for your family
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <strong className="text-gray-900">Child-Safe Content</strong>
                    <p className="text-gray-600">
                      Every story is filtered and crafted to be appropriate for young readers
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-100 to-purple-100 rounded-3xl p-8 aspect-square flex items-center justify-center">
                <div className="text-center">
                  <div className="relative">
                    <span className="text-8xl mb-4 block">📚</span>
                    <span className="absolute -top-2 -right-2 text-3xl animate-bounce">🎙️</span>
                  </div>
                  <p className="text-gray-700 font-display font-bold text-lg mt-4">
                    &quot;{featuredEpisode?.guest?.name || 'Sarah'} taught {featuredEpisode ? 'the hero' : 'Maya'}<br/>about building amazing things...&quot;
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Product wisdom meets bedtime magic
                  </p>
                </div>
              </div>
              {/* Decorative badges */}
              <div className="absolute -top-4 -right-4 bg-accent-400 text-white px-4 py-2 rounded-full font-semibold shadow-lg animate-wiggle">
                AI Powered
              </div>
              <div className="absolute -bottom-4 -left-4 bg-purple-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                Lenny Approved
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Testimonial/Social Proof */}
      <section className="py-16 bg-gray-50">
        <Container size="md">
          <div className="text-center">
            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-2xl text-accent-400">⭐</span>
              ))}
            </div>
            <blockquote className="text-xl text-gray-700 italic mb-4">
              &quot;My daughter Maya giggles every time she sees her name in the book.
              And I love that the story about &#39;shipping fast&#39; came from my favorite
              Lenny episode with Keith Rabois!&quot;
            </blockquote>
            <p className="text-gray-600 font-medium">
              — Sarah, Product Manager & Mom
            </p>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-purple-600 text-white">
        <Container size="md">
          <div className="text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Ready to Create Bedtime Magic?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Turn product wisdom into adventures your kids will ask for
              again and again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/discover">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary-600 hover:bg-gray-100"
                >
                  Browse Lenny Episodes
                </Button>
              </Link>
              <Link href="/create">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Upload Your Own
                </Button>
              </Link>
            </div>
            <p className="text-white/60 text-sm mt-4">
              No account required. Create your first book in under 2 minutes.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
