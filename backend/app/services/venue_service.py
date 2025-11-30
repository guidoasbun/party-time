"""
FR-8: The system shall provide a venue search interface.
Phase 7.1.1: Google Places API Integration
Venue Service for Google Places API Integration (Phase 7.1.1)

Provides venue search, details retrieval, and caching functionality
using Google Places API (New) - the modern REST-based API.
"""
import logging
import json
import hashlib
from typing import Optional, List, Dict, Any
from uuid import UUID
import httpx
import redis.asyncio as redis

from app.core.config import get_settings
from app.schemas.venue import (
    VenueSearchParams,
    VenueSearchResult,
    VenueDetailsResponse,
    VenuePhotoResponse,
    VenueReviewResponse,
    VenueOpeningHours,
    VenueOpeningPeriod,
    VenueLocation,
    VenueSearchResponse,
)

logger = logging.getLogger(__name__)


class VenueService:
    """Service for Google Places API integration with Redis caching."""

    # Google Places API (New) base URL
    PLACES_API_BASE = "https://places.googleapis.com/v1"

    # Cache TTLs (in seconds)
    CACHE_TTL_SEARCH = 3600  # 1 hour for search results
    CACHE_TTL_DETAILS = 86400  # 24 hours for venue details
    CACHE_TTL_PHOTOS = 604800  # 7 days for photo URLs

    # Field masks for cost optimization (only request needed fields)
    SEARCH_FIELD_MASK = ",".join([
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.location",
        "places.rating",
        "places.userRatingCount",
        "places.priceLevel",
        "places.types",
        "places.photos",
        "places.currentOpeningHours",
    ])

    DETAILS_FIELD_MASK = ",".join([
        "id",
        "displayName",
        "formattedAddress",
        "location",
        "rating",
        "userRatingCount",
        "priceLevel",
        "types",
        "nationalPhoneNumber",
        "internationalPhoneNumber",
        "websiteUri",
        "currentOpeningHours",
        "regularOpeningHours",
        "photos",
        "reviews",
        "googleMapsUri",
        "editorialSummary",
    ])

    def __init__(self):
        settings = get_settings()
        self.api_key = settings.GOOGLE_PLACES_API_KEY
        self.redis_url = settings.REDIS_URL

        if not self.api_key:
            logger.warning("Google Places API key not configured")

        self._redis_client: Optional[redis.Redis] = None

    async def _get_redis(self) -> Optional[redis.Redis]:
        """Get Redis client for caching (lazy initialization)."""
        if self._redis_client is None:
            try:
                # Use database 2 for venue cache (separate from Celery)
                redis_url = self.redis_url.rsplit('/', 1)[0] + '/2'
                self._redis_client = redis.from_url(redis_url, decode_responses=True)
                await self._redis_client.ping()
                logger.debug("Redis connection established for venue caching")
            except Exception as e:
                logger.warning(f"Redis not available for venue caching: {e}")
                self._redis_client = None
        return self._redis_client

    def _cache_key(self, prefix: str, identifier: str) -> str:
        """Generate a cache key."""
        return f"venue:{prefix}:{identifier}"

    def _hash_params(self, params: Dict[str, Any]) -> str:
        """Generate a hash from search parameters for cache key."""
        param_str = json.dumps(params, sort_keys=True)
        return hashlib.md5(param_str.encode()).hexdigest()

    async def _get_cached(self, key: str) -> Optional[Dict[str, Any]]:
        """Retrieve cached data."""
        redis_client = await self._get_redis()
        if redis_client:
            try:
                data = await redis_client.get(key)
                if data:
                    return json.loads(data)
            except Exception as e:
                logger.warning(f"Cache read error: {e}")
        return None

    async def _set_cached(self, key: str, data: Dict[str, Any], ttl: int) -> None:
        """Store data in cache."""
        redis_client = await self._get_redis()
        if redis_client:
            try:
                await redis_client.setex(key, ttl, json.dumps(data))
            except Exception as e:
                logger.warning(f"Cache write error: {e}")

    async def search_venues(
        self,
        params: VenueSearchParams
    ) -> VenueSearchResponse:
        """
        Search for venues using Google Places API (New) Text Search.

        Args:
            params: Search parameters including query, location, radius, filters

        Returns:
            VenueSearchResponse with list of venues and metadata
        """
        if not self.api_key:
            logger.error("Google Places API key not configured")
            return VenueSearchResponse(results=[], total_results=0, query=params.query)

        # Check cache first
        cache_params = {
            "query": params.query,
            "lat": params.latitude,
            "lng": params.longitude,
            "radius": params.radius,
            "type": params.venue_type,
            "min_rating": params.min_rating,
        }
        cache_key = self._cache_key("search", self._hash_params(cache_params))
        cached = await self._get_cached(cache_key)
        if cached:
            logger.debug(f"Cache hit for venue search: {params.query}")
            return VenueSearchResponse(**cached, cached=True)

        # Build request body for Places API (New)
        request_body: Dict[str, Any] = {
            "textQuery": params.query,
            "maxResultCount": min(params.max_results, 20),  # API limit is 20
        }

        # Add location bias if coordinates provided
        if params.latitude is not None and params.longitude is not None:
            request_body["locationBias"] = {
                "circle": {
                    "center": {
                        "latitude": params.latitude,
                        "longitude": params.longitude,
                    },
                    "radius": float(params.radius),
                }
            }

        # Add type filter if specified
        if params.venue_type:
            request_body["includedType"] = params.venue_type

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.PLACES_API_BASE}/places:searchText",
                    headers={
                        "Content-Type": "application/json",
                        "X-Goog-Api-Key": self.api_key,
                        "X-Goog-FieldMask": self.SEARCH_FIELD_MASK,
                    },
                    json=request_body,
                )

                if response.status_code != 200:
                    logger.error(f"Places API error: {response.status_code} - {response.text}")
                    return VenueSearchResponse(results=[], total_results=0, query=params.query)

                data = response.json()
                places = data.get("places", [])

                # Transform results
                results: List[VenueSearchResult] = []
                for place in places:
                    # Apply min_rating filter (not supported by API directly)
                    rating = place.get("rating")
                    if params.min_rating and rating and rating < params.min_rating:
                        continue

                    # Get primary photo URL if available
                    photo_url = None
                    photos = place.get("photos", [])
                    if photos:
                        photo_name = photos[0].get("name")
                        if photo_name:
                            photo_url = await self._get_photo_url(photo_name, 400, 300)

                    # Parse opening hours
                    open_now = None
                    opening_hours = place.get("currentOpeningHours", {})
                    if opening_hours:
                        open_now = opening_hours.get("openNow")

                    location = place.get("location", {})
                    # Extract clean place_id (remove "places/" prefix if present)
                    raw_id = place.get("id", "")
                    clean_id = raw_id.replace("places/", "") if raw_id.startswith("places/") else raw_id
                    results.append(VenueSearchResult(
                        place_id=clean_id,
                        name=place.get("displayName", {}).get("text", "Unknown"),
                        address=place.get("formattedAddress", ""),
                        location=VenueLocation(
                            latitude=location.get("latitude", 0),
                            longitude=location.get("longitude", 0),
                        ),
                        rating=rating,
                        user_ratings_total=place.get("userRatingCount"),
                        price_level=self._parse_price_level(place.get("priceLevel")),
                        types=place.get("types", []),
                        photo_url=photo_url,
                        open_now=open_now,
                    ))

                response_data = VenueSearchResponse(
                    results=results,
                    total_results=len(results),
                    query=params.query,
                    cached=False,
                )

                # Cache the results
                await self._set_cached(
                    cache_key,
                    response_data.model_dump(exclude={"cached"}),
                    self.CACHE_TTL_SEARCH
                )

                return response_data

        except httpx.TimeoutException:
            logger.error("Google Places API request timed out")
            return VenueSearchResponse(results=[], total_results=0, query=params.query)
        except Exception as e:
            logger.error(f"Error searching venues: {e}")
            return VenueSearchResponse(results=[], total_results=0, query=params.query)

    async def get_venue_details(self, place_id: str) -> Optional[VenueDetailsResponse]:
        """
        Get detailed information about a venue.

        Args:
            place_id: Google Place ID

        Returns:
            VenueDetailsResponse with full venue details, or None if not found
        """
        if not self.api_key:
            logger.error("Google Places API key not configured")
            return None

        # Check cache first
        cache_key = self._cache_key("details", place_id)
        cached = await self._get_cached(cache_key)
        if cached:
            logger.debug(f"Cache hit for venue details: {place_id}")
            return VenueDetailsResponse(**cached)

        try:
            # Handle both formats: "ChIJ..." and "places/ChIJ..."
            clean_place_id = place_id.replace("places/", "") if place_id.startswith("places/") else place_id

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.PLACES_API_BASE}/places/{clean_place_id}",
                    headers={
                        "X-Goog-Api-Key": self.api_key,
                        "X-Goog-FieldMask": self.DETAILS_FIELD_MASK,
                    },
                )

                if response.status_code != 200:
                    logger.error(f"Places API error: {response.status_code} - {response.text}")
                    return None

                place = response.json()

                # Parse photos
                photos: List[VenuePhotoResponse] = []
                for photo in place.get("photos", [])[:10]:  # Limit to 10 photos
                    photo_name = photo.get("name")
                    if photo_name:
                        photo_url = await self._get_photo_url(photo_name, 800, 600)
                        if photo_url:
                            # Extract attribution display names from authorAttributions objects
                            author_attributions = photo.get("authorAttributions", [])
                            attributions = [
                                attr.get("displayName", "")
                                for attr in author_attributions
                                if isinstance(attr, dict)
                            ]
                            photos.append(VenuePhotoResponse(
                                url=photo_url,
                                width=photo.get("widthPx", 800),
                                height=photo.get("heightPx", 600),
                                attributions=attributions,
                            ))

                # Parse reviews
                reviews: List[VenueReviewResponse] = []
                for review in place.get("reviews", [])[:5]:  # Limit to 5 reviews
                    author = review.get("authorAttribution", {})
                    reviews.append(VenueReviewResponse(
                        author_name=author.get("displayName", "Anonymous"),
                        rating=review.get("rating", 0),
                        text=review.get("text", {}).get("text", ""),
                        time=review.get("publishTime", 0),
                        relative_time_description=review.get("relativePublishTimeDescription", ""),
                        profile_photo_url=author.get("photoUri"),
                    ))

                # Parse opening hours
                opening_hours = None
                regular_hours = place.get("regularOpeningHours", {})
                current_hours = place.get("currentOpeningHours", {})
                if regular_hours or current_hours:
                    periods: List[VenueOpeningPeriod] = []
                    for period in regular_hours.get("periods", []):
                        open_info = period.get("open", {})
                        close_info = period.get("close", {})
                        if open_info:
                            periods.append(VenueOpeningPeriod(
                                open_day=open_info.get("day", 0),
                                open_time=f"{open_info.get('hour', 0):02d}:{open_info.get('minute', 0):02d}",
                                close_day=close_info.get("day", open_info.get("day", 0)),
                                close_time=f"{close_info.get('hour', 23):02d}:{close_info.get('minute', 59):02d}",
                            ))

                    opening_hours = VenueOpeningHours(
                        open_now=current_hours.get("openNow"),
                        weekday_text=regular_hours.get("weekdayDescriptions", []),
                        periods=periods,
                    )

                location = place.get("location", {})
                details = VenueDetailsResponse(
                    place_id=place.get("id", place_id),
                    name=place.get("displayName", {}).get("text", "Unknown"),
                    address=place.get("formattedAddress", ""),
                    formatted_address=place.get("formattedAddress", ""),
                    location=VenueLocation(
                        latitude=location.get("latitude", 0),
                        longitude=location.get("longitude", 0),
                    ),
                    rating=place.get("rating"),
                    user_ratings_total=place.get("userRatingCount"),
                    price_level=self._parse_price_level(place.get("priceLevel")),
                    types=place.get("types", []),
                    phone=place.get("nationalPhoneNumber") or place.get("internationalPhoneNumber"),
                    website=place.get("websiteUri"),
                    opening_hours=opening_hours,
                    photos=photos,
                    reviews=reviews,
                    url=place.get("googleMapsUri"),
                    editorial_summary=place.get("editorialSummary", {}).get("text"),
                )

                # Cache the results
                await self._set_cached(
                    cache_key,
                    details.model_dump(),
                    self.CACHE_TTL_DETAILS
                )

                return details

        except httpx.TimeoutException:
            logger.error("Google Places API request timed out")
            return None
        except Exception as e:
            logger.error(f"Error getting venue details: {e}")
            return None

    async def get_venue_photos(
        self,
        place_id: str,
        max_width: int = 800,
        max_height: int = 600,
        limit: int = 10
    ) -> List[VenuePhotoResponse]:
        """
        Get photos for a venue.

        Args:
            place_id: Google Place ID
            max_width: Maximum photo width
            max_height: Maximum photo height
            limit: Maximum number of photos to return

        Returns:
            List of photo URLs
        """
        # Get venue details (which includes photos)
        details = await self.get_venue_details(place_id)
        if not details:
            return []

        # Return photos up to limit
        return details.photos[:limit]

    async def _get_photo_url(
        self,
        photo_name: str,
        max_width: int,
        max_height: int
    ) -> Optional[str]:
        """
        Generate a photo URL from a photo resource name.

        Args:
            photo_name: Photo resource name from Places API
            max_width: Maximum width
            max_height: Maximum height

        Returns:
            Photo URL or None
        """
        if not self.api_key:
            return None

        # Check cache
        cache_key = self._cache_key("photo", f"{photo_name}:{max_width}x{max_height}")
        cached = await self._get_cached(cache_key)
        if cached:
            return cached.get("url")

        try:
            # The photo name format is "places/{place_id}/photos/{photo_id}"
            # We need to call the photo endpoint to get the actual URL
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    f"{self.PLACES_API_BASE}/{photo_name}/media",
                    headers={
                        "X-Goog-Api-Key": self.api_key,
                    },
                    params={
                        "maxHeightPx": max_height,
                        "maxWidthPx": max_width,
                        "skipHttpRedirect": "true",
                    },
                )

                if response.status_code == 200:
                    data = response.json()
                    photo_url = data.get("photoUri")
                    if photo_url:
                        # Cache the URL
                        await self._set_cached(
                            cache_key,
                            {"url": photo_url},
                            self.CACHE_TTL_PHOTOS
                        )
                        return photo_url

        except Exception as e:
            logger.warning(f"Error getting photo URL: {e}")

        return None

    def _parse_price_level(self, price_level: Optional[str]) -> Optional[int]:
        """Convert Places API (New) price level string to integer."""
        if not price_level:
            return None
        price_map = {
            "PRICE_LEVEL_FREE": 0,
            "PRICE_LEVEL_INEXPENSIVE": 1,
            "PRICE_LEVEL_MODERATE": 2,
            "PRICE_LEVEL_EXPENSIVE": 3,
            "PRICE_LEVEL_VERY_EXPENSIVE": 4,
        }
        return price_map.get(price_level)


# Global service instance
venue_service = VenueService()
