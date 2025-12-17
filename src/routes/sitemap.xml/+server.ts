import type { RequestHandler } from './$types';

const SITE_URL = 'https://buildboard.hackclub.com';

const staticPages = [
    '',
    '/about',
    '/faq',
    '/faq/getting-started',
    '/faq/submitting-your-project',
    '/faq/the-billboard',
    '/faq/account-and-profile',
    '/faq/technical-issues-and-other'
];

export const GET: RequestHandler = async () => {
    const today = new Date().toISOString().split('T')[0];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
    .map(
        (page) => `  <url>
    <loc>${SITE_URL}${page}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '' ? '1.0' : page === '/about' ? '0.8' : '0.6'}</priority>
  </url>`
    )
    .join('\n')}
</urlset>`;

    return new Response(sitemap.trim(), {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'max-age=3600'
        }
    });
};
