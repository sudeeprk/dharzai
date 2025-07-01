"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Coffee,
  Fuel,
  Search,
  ShoppingCart,
  Stethoscope,
  UtensilsCrossed,
  AlertTriangle,
  CalendarDays,
  MapPin,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { PlaceCard } from "@/components/explore/place-card";
import { Skeleton } from "@/components/ui/skeleton";

interface Location {
  lat: number;
  lng: number;
}

interface Place {
  id: string;
  displayName: { text: string };
  formattedAddress: string;
  rating?: number;
  websiteUri?: string;
  photoUrl: string;
  reviews?: any[];
}

const categoryButtons = [
  { name: "Restaurants", icon: UtensilsCrossed, query: "restaurants near me" },
  { name: "Doctors", icon: Stethoscope, query: "doctors near me" },
  { name: "Grocery", icon: ShoppingCart, query: "grocery stores near me" },
  { name: "Coffee", icon: Coffee, query: "coffee shops near me" },
  { name: "Gas Stations", icon: Fuel, query: "gas stations near me" },
  { name: "Events", icon: CalendarDays, query: "events near me" },
] as const;

export function ExploreClient() {
  const resultsRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [locationStatus, setLocationStatus] = useState(
    "Requesting location..."
  );
  const [locationError, setLocationError] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const requestLocation = () => {
      setIsLocationLoading(true);

      if (!("geolocation" in navigator)) {
        setLocationError(true);
        setLocationStatus("Geolocation is not supported by your browser.");
        setIsLocationLoading(false);
        return;
      }

      const timeoutId = setTimeout(() => {
        setLocationError(true);
        setLocationStatus("Location request timed out. Using default search.");
        setIsLocationLoading(false);
      }, 10000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationStatus("Location access granted.");
          setLocationError(false);
          setIsLocationLoading(false);
        },
        (error) => {
          clearTimeout(timeoutId);
          setLocationError(true);
          let errorMessage = "Location access denied.";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location access denied. Please enable location in your browser.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
            default:
              errorMessage = "Unable to retrieve location.";
          }

          setLocationStatus(errorMessage);
          setIsLocationLoading(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 300000,
        }
      );
    };

    const timer = setTimeout(requestLocation, 100);
    return () => clearTimeout(timer);
  }, [mounted]);

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setError("Please enter a search query.");
        return;
      }

      setIsLoading(true);
      setError(null);
      setResults([]);

      try {
        const requestBody = {
          query: searchQuery.trim(),
          location: location,
        };

        const response = await fetch("/api/places", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Request failed with status ${response.status}`
          );
        }

        const data = await response.json();

        if (data.places && Array.isArray(data.places)) {
          setResults(data.places);
          resultsRef.current?.scrollIntoView({ behavior: "smooth" });
          if (data.places.length === 0) {
            setError(
              `No results found for "${searchQuery}". Try a different search term.`
            );
          }
        } else {
          throw new Error("Invalid response format from server");
        }
      } catch (e: any) {
        console.error("Search error:", e);
        const errorMessage =
          e.message || "An error occurred while searching. Please try again.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [location]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        handleSearch(query);
      }
    },
    [query, handleSearch]
  );

  const handleCategoryClick = useCallback(
    (categoryQuery: string) => {
      setQuery(categoryQuery);
      handleSearch(categoryQuery);
    },
    [handleSearch]
  );

  const retryLocation = useCallback(() => {
    if (!mounted) return;
    setLocationError(false);
    setLocationStatus("Requesting location...");
    setIsLocationLoading(true);
    setTimeout(() => window.location.reload(), 100);
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <div className="flex flex-col items-center text-center space-y-2 pt-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Find Anything Nearby
        </h1>
        <p className="hidden md:block text-muted-foreground max-w-2xl text-sm md:text-lg">
          Want a good pizza place near home? Need a nearby doctor, grocery
          store, or something fun to do this weekend? Just ask Dharz AI — we'll
          find it for you using live local search.
        </p>
      </div>

      <Card className="max-w-4xl mx-auto p-4 md:p-6 shadow">
        <form onSubmit={handleSubmit} className="relative mb-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything... e.g., 'Where can I get breakfast near me?'"
            className="h-14 text-base pl-4 pr-16 rounded-lg"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-md"
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </Button>
        </form>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            {isLocationLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : locationError ? (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            ) : (
              <MapPin className="h-4 w-4 text-green-500" />
            )}
            <span
              className={
                locationError ? "text-orange-600" : "text-muted-foreground"
              }
            >
              {locationStatus}
            </span>
            {locationError && (
              <Button
                variant="link"
                size="sm"
                onClick={retryLocation}
                className="h-auto p-0 text-xs underline"
              >
                Retry
              </Button>
            )}
          </div>
        </div>

        {/* Updated category buttons section with horizontal scroll */}
        <div className="mb-6 overflow-hidden">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:grid md:grid-cols-6 md:overflow-visible md:pb-0">
            {categoryButtons.map((item) => (
              <Button
                key={item.name}
                variant="outline"
                className="flex flex-row gap-2 hover:bg-accent transition-colors whitespace-nowrap flex-shrink-0 md:flex-shrink"
                onClick={() => handleCategoryClick(item.query)}
                disabled={isLoading}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs">{item.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Add custom CSS for hiding scrollbar */}
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </Card>

      <div className="max-w-7xl mx-auto">
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive text-lg font-medium mb-2">
              Search Error
            </p>
            <p className="text-muted-foreground">{error}</p>
            {query && (
              <Button
                variant="outline"
                onClick={() => handleSearch(query)}
                className="mt-4"
                disabled={isLoading}
              >
                Try Again
              </Button>
            )}
          </div>
        )}

        {!isLoading && !error && results.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Found {results.length} results for "{query}"
              </h2>
            </div>
            <div
              ref={resultsRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {results.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </>
        )}

        {!isLoading && !error && results.length === 0 && query && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              No results found for "{query}"
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Try searching for something else or check your spelling
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
