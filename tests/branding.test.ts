import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');
const banned = /workout|fitness|gym/i;

describe('discreet branding', () => {
  it('index.html title and app-title meta are "Enjoy Life" with no banned words', () => {
    const html = readFileSync(join(root, 'index.html'), 'utf8');
    expect(html).toContain('<title>Enjoy Life</title>');
    expect(html).toContain('name="apple-mobile-web-app-title" content="Enjoy Life"');
    expect(html).not.toMatch(banned);
  });
  it('manifest name and short name are "Enjoy Life"', () => {
    const cfg = readFileSync(join(root, 'vite.config.ts'), 'utf8');
    expect(cfg).toContain("name: 'Enjoy Life'");
    expect(cfg).toContain("short_name: 'Enjoy Life'");
    expect(cfg).toContain("display: 'standalone'");
    expect(cfg).not.toMatch(banned);
  });
});
