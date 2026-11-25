import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pranora - Comprehensive Pet Care & Rescue Bangladesh',
    short_name: 'Pranora',
    description: 'Find verified vets, emergency rescue, pet adoption, sitting, and health records in Bangladesh.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAF7',
    theme_color: '#2F7B53',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
