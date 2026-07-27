'use strict';

const fs = require('node:fs');
const path = require('node:path');

const imageExtensions = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.avif'
]);

function findImages(directory, results = []) {
  if (!fs.existsSync(directory)) return results;

  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      findImages(fullPath, results);
    } else if (imageExtensions.has(path.extname(entry.name).toLowerCase())) {
      results.push(fullPath);
    }
  }

  return results;
}

function escapeHtml(value) {
  const characters = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  return value.replace(/[&<>"']/g, character => characters[character]);
}

hexo.extend.tag.register('photo_gallery', function () {
  const photoDirectory = path.join(hexo.source_dir, 'img', 'photos');
  const siteRoot = (hexo.config.root || '/').replace(/\/?$/, '/');

  const images = findImages(photoDirectory).sort((left, right) =>
    right.localeCompare(left, 'zh-CN')
  );

  if (images.length === 0) {
    return '<p>相册中暂时没有照片。</p>';
  }

  const items = images.map(filePath => {
    const relativePath = path.relative(photoDirectory, filePath);
    const urlPath = relativePath
      .split(path.sep)
      .map(encodeURIComponent)
      .join('/');

    const imageUrl = `${siteRoot}img/photos/${urlPath}`;
    const imageName = escapeHtml(
      path.basename(filePath, path.extname(filePath))
    );

   return `
  <div class="auto-gallery-item">
    <img src="${imageUrl}"
         alt="${imageName}"
         loading="lazy"
         decoding="async">
  </div>
`;
  });

  return `<div class="auto-photo-gallery">${items.join('')}</div>`;
});