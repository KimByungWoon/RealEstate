import React, { useEffect, useRef } from 'react';

declare global {
    interface Window { naver: any; }
}

interface NaverMapProps {
  center: { lat: number; lng: number; };
  markerPosition: { lat: number; lng: number; } | null;
  onMapClick: (coords: { lat: number; lng: number; }) => void;
}

export const NaverMap: React.FC<NaverMapProps> = ({ center, markerPosition, onMapClick }) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapElement.current || !window.naver) return;

    // Initialize map only once
    if (!mapInstance.current) {
      const location = new window.naver.maps.LatLng(center.lat, center.lng);
      const mapOptions = {
        center: location,
        zoom: 16,
        zoomControl: true,
        zoomControlOptions: {
          position: window.naver.maps.Position.TOP_RIGHT,
          style: window.naver.maps.ZoomControlStyle.LARGE,
        },
      };

      const map = new window.naver.maps.Map(mapElement.current, mapOptions);
      mapInstance.current = map;

      // Add click listener
      window.naver.maps.Event.addListener(map, 'click', (e: any) => {
        onMapClick({
          lat: e.coord.lat(),
          lng: e.coord.lng(),
        });
      });
    }

    // Pan map to new center if it changes
    if (mapInstance.current) {
        mapInstance.current.panTo(new window.naver.maps.LatLng(center.lat, center.lng));
    }
    
    // Handle marker updates
    if (markerPosition) {
        const newMarkerPosition = new window.naver.maps.LatLng(markerPosition.lat, markerPosition.lng);
        if (!markerInstance.current) {
            markerInstance.current = new window.naver.maps.Marker({
                position: newMarkerPosition,
                map: mapInstance.current,
            });
        } else {
            markerInstance.current.setPosition(newMarkerPosition);
        }
    } else if (markerInstance.current) {
        markerInstance.current.setMap(null);
        markerInstance.current = null;
    }

  }, [center, markerPosition, onMapClick]);

  return <div ref={mapElement} style={{ width: '100%', height: '400px', borderRadius: '0.75rem' }} />;
};