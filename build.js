#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const md = require('markdown-it')();
const matter = require('gray-matter');

const BLOG_POSTS_DIR = path.join(__dirname, 'blog_posts');
const BLOG_OUTPUT_DIR = path.join(__dirname, 'public', 'blog');

/**
 * Parse frontmatter and return {meta, content}
 */
function parseBlogPost(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);
  // Preserve date as string (gray-matter may parse it as Date)
  if (data.date && typeof data.date === 'object') {
    data.date = data.date.toISOString().split('T')[0];
  }
  return { meta: data, content };
}

/**
 * Generate HTML from a blog post
 */
function generateBlogHTML(slug, { meta, content }) {
  const htmlContent = md.render(content);
  
  const html = `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content="${escapeHtml(meta.excerpt || meta.title)}">
		<title>${escapeHtml(meta.title)} &mdash; SevenStack's Internet Lounge</title>
		<link href="/style.css" rel="stylesheet" type="text/css" media="all">
		<link rel="icon" href="/favicon/favicon.svg" type="image/svg+xml">
		<link rel="icon" href="/favicon/favicon-32.png" sizes="32x32" type="image/png">
		<link rel="icon" href="/favicon/favicon-16.png" sizes="16x16" type="image/png">
		<link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png">
		<link rel="manifest" href="/favicon/site.webmanifest">
	</head>
	<body>
		<div class="page">
			<header class="masthead">
				<h1>SevenStack's Internet Lounge</h1>
				<p class="tagline">a little corner of the information superhighway</p>
			</header>

			<nav class="nav">
				<a href="/index.html">home</a>
				<a href="/about.html">about</a>
				<a href="/blog/index.html" aria-current="page">blog</a>
				<a href="/links.html">links</a>
				<a href="/contact.html">contact</a>
			</nav>

			<main class="content">
				<h1>${escapeHtml(meta.title)}</h1>
				<p class="post-date">Posted ${meta.date}</p>

${htmlContent}

				<p><a href="/blog/index.html">&larr; Back to blog</a></p>
			</main>
		</div>
	</body>
</html>`;

  return html;
}

/**
 * Generate blog index page with all posts
 */
function generateBlogIndex(posts) {
  const postsList = posts
    .sort((a, b) => new Date(b.meta.date) - new Date(a.meta.date))
    .map(post => {
      const excerpt = post.meta.excerpt || post.meta.title;
      const dateStr = typeof post.meta.date === 'string' ? post.meta.date : String(post.meta.date);
      return `<article>
			<h2><a href="/blog/${post.slug}.html">${escapeHtml(post.meta.title)}</a></h2>
			<p class="post-date">Posted ${dateStr}</p>
			<p>${escapeHtml(excerpt)}</p>
		</article>`;
    })
    .join('\n\n');

  const html = `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content="SevenStack's blog">
		<title>Blog &mdash; SevenStack's Internet Lounge</title>
		<link href="/style.css" rel="stylesheet" type="text/css" media="all">
		<link rel="icon" href="/favicon/favicon.svg" type="image/svg+xml">
		<link rel="icon" href="/favicon/favicon-32.png" sizes="32x32" type="image/png">
		<link rel="icon" href="/favicon/favicon-16.png" sizes="16x16" type="image/png">
		<link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png">
		<link rel="manifest" href="/favicon/site.webmanifest">
	</head>
	<body>
		<div class="page">
			<header class="masthead">
				<h1>SevenStack's Internet Lounge</h1>
				<p class="tagline">a little corner of the information superhighway</p>
			</header>

			<nav class="nav">
				<a href="/index.html">home</a>
				<a href="/about.html">about</a>
				<a href="/blog/index.html" aria-current="page">blog</a>
				<a href="/links.html">links</a>
				<a href="/contact.html">contact</a>
			</nav>

			<main class="content">
				<h1>Blog</h1>
				<div class="blog-posts">
${postsList}
				</div>
			</main>
		</div>
	</body>
</html>`;

  return html;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Build all blog posts
 */
function buildBlogs() {
  // Ensure output directory exists
  if (!fs.existsSync(BLOG_OUTPUT_DIR)) {
    fs.mkdirSync(BLOG_OUTPUT_DIR, { recursive: true });
  }

  // Get all markdown files
  if (!fs.existsSync(BLOG_POSTS_DIR)) {
    console.warn(`Blog posts directory not found: ${BLOG_POSTS_DIR}`);
    return;
  }

  const files = fs.readdirSync(BLOG_POSTS_DIR)
    .filter(file => file.endsWith('.md'));

  const posts = files.map(file => {
    const filePath = path.join(BLOG_POSTS_DIR, file);
    const slug = file.replace(/\.md$/, '');
    const parsed = parseBlogPost(filePath);
    return { slug, file, ...parsed };
  });

  // Generate individual post pages
  posts.forEach(post => {
    const html = generateBlogHTML(post.slug, { meta: post.meta, content: post.content });
    const outputPath = path.join(BLOG_OUTPUT_DIR, `${post.slug}.html`);
    fs.writeFileSync(outputPath, html, 'utf8');
    console.log(`✓ Generated: ${post.slug}.html`);
  });

  // Generate blog index
  const indexHtml = generateBlogIndex(posts);
  const indexPath = path.join(BLOG_OUTPUT_DIR, 'index.html');
  fs.writeFileSync(indexPath, indexHtml, 'utf8');
  console.log(`✓ Generated: index.html`);
}

module.exports = { buildBlogs };

// Run if called directly
if (require.main === module) {
  buildBlogs();
}
