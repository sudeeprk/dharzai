'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Coffee,
  Fuel,
  Search,
  Send,
  ShoppingCart,
  Stethoscope,
  UtensilsCrossed,
  AlertTriangle,
  CalendarDays,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { PlaceCard } from '@/components/explore/place-card';
import { Skeleton } from '@/components/ui/skeleton';

const categoryButtons = [
  { name: 'Restaurants', icon: UtensilsCrossed, query: 'restaurants near me' },
  { name: 'Doctors', icon: Stethoscope, query: 'doctors near me' },
  { name: 'Grocery', icon: ShoppingCart, query: 'grocery stores near me' },
  { name: 'Coffee', icon: Coffee, query: 'coffee shops near me' },
  { name: 'Gas Stations', icon: Fuel, query: 'gas stations near me' },
  { name: 'Events', icon: CalendarDays, query: 'events near me' },
];

const examplePrompts = [
  'Best vegetarian restaurant near me',
  'Open pharmacy near Fremont now',
  'Events for kids this Saturday',
  'Dentist for Invisalign near Mission Blvd',
  'Coffee shop with WiFi nearby',
  '24 hour gas station near me',
];

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locationStatus, setLocationStatus] = useState(
    'Requesting location...'
  );
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationStatus('Location access granted.');
          setLocationError(false);
        },
        () => {
          setLocationError(true);
          setLocationStatus('Location access denied. Using default location.');
        }
      );
    } else {
      setLocationError(true);
      setLocationStatus('Geolocation is not supported by your browser.');
    }
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, location }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch results.');
      }

      const data = await response.json();
      setResults(data.places || []);
    } catch (e: any) {
      setError(e.message || 'An error occurred while searching.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <AppLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
        <div className="flex flex-col items-center text-center space-y-2 pt-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Find Anything Nearby
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Want a good pizza place near home? Need a nearby doctor, grocery
            store, or something fun to do this weekend? Just ask Dharz AI —
            we'll find it for you using live local search.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto p-4 md:p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="relative mb-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything... e.g., 'Where can I get breakfast near me?'"
              className="h-14 text-base pl-4 pr-16 rounded-lg"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-md"
              disabled={isLoading}
            >
              <Search className="h-5 w-5" />
            </Button>
          </form>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Send className="h-4 w-4" />
            {locationError && <AlertTriangle className="h-4 w-4 text-orange-500" />}
            <span className={locationError ? 'text-orange-600' : ''}>
              {locationStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-6">
            {categoryButtons.map((item) => (
              <Button
                key={item.name}
                variant="outline"
                className="flex flex-col h-20 gap-2"
                onClick={() => {
                  setQuery(item.query);
                  handleSearch(item.query);
                }}
              >
                <item.icon className="h-6 w-6" />
                <span>{item.name}</span>
              </Button>
            ))}
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setQuery(prompt);
                    handleSearch(prompt);
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="max-w-7xl mx-auto">
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          )}
          {error && <p className="text-center text-destructive">{error}</p>}
          {!isLoading && results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
           {!isLoading && !error && results.length === 0 && query && (
             <p className="text-center text-muted-foreground mt-8">No results found for "{query}". Try a different search.</p>
           )}
        </div>
      </div>
    </AppLayout>
  );
}
