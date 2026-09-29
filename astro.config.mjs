import { defineConfig } from 'astro/config';
export default defineConfig({ site: process.env.SITE_URL || 'https://teren-architecture.sweet-hake-2744.chatgpt.site', output: 'static', trailingSlash: 'always', devToolbar: { enabled: false } });
