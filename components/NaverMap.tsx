import React, { useEffect, useRef } from 'react';

declare global {
    interface Window { naver: any; }
}

interface NaverMapProps {
  center: {
    lat: number;
    lng: number;
  };
}

export const NaverMap: React.FC<NaverMapProps> = ({ center }) => {
  const mapElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapElement.current || !window.naver) return;

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
    new window.naver.maps.Marker({
      position: location,
      map,
    });
  }, [center]);

  return <div ref={mapElement} style={{ width: '100%', height: '400px', borderRadius: '0.75rem' }} />;
};
