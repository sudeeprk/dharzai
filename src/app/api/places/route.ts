import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { query, location } = await req.json();

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error("Google Places API key is missing");
    return NextResponse.json(
      { error: "Internal server error: API key not configured" },
      { status: 500 }
    );
  }

  const url = "https://places.googleapis.com/v1/places:searchText";

  const requestBody: any = {
    textQuery: query,
    maxResultCount: 12,
  };

  if (location) {
    requestBody.locationBias = {
      circle: {
        center: {
          latitude: location.lat,
          longitude: location.lng,
        },
        radius: 10000.0, // 10km radius
      },
    };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.rating,places.websiteUri,places.photos,places.id,places.reviews,places.googleMapsUri",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Google Places API Error:", errorBody);
      throw new Error(
        `Google Places API request failed: ${response.statusText}`
      );
    }

    const data = await response.json();

    const placesWithPhotos = (data.places || []).map((place: any) => {
      let photoUrl = `https://placehold.co/600x400.png`; // Default placeholder
      if (place.photos && place.photos.length > 0) {
        const photoName = place.photos[0].name;
        photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=400&key=${apiKey}`;
      }
      return { ...place, photoUrl };
    });

    return NextResponse.json({ places: placesWithPhotos });
  } catch (error) {
    console.error("Error fetching from Google Places API:", error);
    return NextResponse.json(
      { error: "Failed to fetch from Google Places API" },
      { status: 500 }
    );
  }
}
