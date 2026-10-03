// Uploads are handled by the Next.js App Router route:
// app/api/upload/route.js
// This file intentionally returns a clear message instead of exposing Blob internals.

export default function handler(req, res) {
  res.status(410).json({
    error: 'Upload endpoint moved to /api/upload.',
  });
}
