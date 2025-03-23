import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/auth/login', '/auth/register', '/faq', '/contact'],
      disallow: [
        '/admin/', 
        '/staff/', 
        '/user/', 
        '/guest/',
        '/api/'
      ],
    },
    sitemap: 'https://hau2park-web.vercel.app/sitemap.xml',
  };
}