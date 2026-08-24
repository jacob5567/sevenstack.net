# Blog Setup

Your blog now uses markdown files that are automatically converted to HTML!

## How It Works

1. **Write posts as markdown** — Add `.md` files to the `blog_posts/` directory
2. **Push to main** — When you push, GitHub Actions automatically:
   - Installs dependencies
   - Runs the build script to convert `.md` → `.html`
   - Deploys the site to Neocities

## Creating a Blog Post

Create a new file in `blog_posts/` with a `.md` extension. Include frontmatter (YAML) at the top:

```markdown
---
title: My Blog Post Title
date: 2026-08-24
excerpt: A short excerpt for the blog index.
---

# Content starts here

Write your post in **markdown** format. It supports:
- Lists
- *Italics* and **bold**
- `Code blocks`
- [Links](https://example.com)
- And all standard markdown features!
```

### Frontmatter Fields

- `title` (required) — The blog post title
- `date` (required) — Publication date (format: YYYY-MM-DD)
- `excerpt` (optional) — Short description shown on blog index; defaults to title if omitted

## Building Locally

To build blog posts on your local machine:

```bash
# Install dependencies (first time only)
npm install

# Build the blog
npm run build

# Watch for changes (optional)
npm run watch
```

This generates HTML files in `public/blog/` which are deployed to your site.

## File Structure

```
blog_posts/              ← Write your .md files here
├── hello-world.md
├── my-first-post.md
└── another-post.md

public/blog/             ← Generated HTML (auto-created)
├── index.html          ← Auto-generated index of all posts
├── hello-world.html    ← Generated from hello-world.md
├── my-first-post.html
└── another-post.html
```

## Example Post

See `blog_posts/hello-world.md` for an example of how to format a post.

## Customization

The build script (`build.js`) generates HTML with your site's template. If you want to:
- Change the HTML structure
- Add CSS classes
- Modify how posts are formatted

Edit `build.js` directly. The `generateBlogHTML()` and `generateBlogIndex()` functions control the output format.
