import { defineConfig } from 'astro/config';
export default defineConfig({ site: process.env.SITE_URL || 'https://teren-architecture.coookiemail.chatgpt.site', output: 'static', trailingSlash: 'always', devToolbar: { enabled: false } });
