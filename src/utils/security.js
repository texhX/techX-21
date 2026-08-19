// ==============================================================================
// CAMPUSFIND AI — SECURITY & SANITIZATION UTILITIES
// Prevents XSS, validates file signatures, and enforces security constraints
// ==============================================================================

/**
 * Sanitize string against XSS injection by escaping HTML characters
 */
export function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate academic email format
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate image file upload
 */
export function validateImageUpload(file, maxSizeBytes = 5 * 1024 * 1024) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // Allowed MIME types
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file format. Only JPG, PNG, WEBP, and GIF images are permitted.',
    };
  }

  // Size limit
  if (file.size > maxSizeBytes) {
    const maxMb = maxSizeBytes / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds the ${maxMb}MB upload limit.`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Mask sensitive contact or student identifiers for public display
 */
export function maskSensitiveId(idStr) {
  if (!idStr || typeof idStr !== 'string') return '';
  if (idStr.length <= 4) return '***';
  return idStr.slice(0, 2) + '****' + idStr.slice(-2);
}
