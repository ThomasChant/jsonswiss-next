import { toast } from '@/lib/toast';

export interface UrlImportResult {
  json: any;
  raw: string;
  url: string;
  contentType?: string;
}

export interface UrlImportOptions {
  timeout?: number;
  headers?: Record<string, string>;
  followRedirects?: boolean;
}

const DEFAULT_TIMEOUT = 10000; // 10 seconds

export async function fetchJsonFromUrl(
  url: string, 
  options: UrlImportOptions = {}
): Promise<UrlImportResult> {
  const { timeout = DEFAULT_TIMEOUT, headers = {}, followRedirects = true } = options;

  // URL validation
  let validUrl: URL;
  try {
    validUrl = new URL(url);
  } catch (error) {
    throw new Error('Invalid URL format. Please enter a valid URL (e.g., https://api.example.com/data.json)');
  }

  // Protocol validation
  if (!['http:', 'https:'].includes(validUrl.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are supported');
  }

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Default headers for JSON requests
    const fetchHeaders = {
      'Accept': 'application/json, text/plain, */*',
      'User-Agent': 'JSON Swiss Tool',
      ...headers,
    };

    const response = await fetch(validUrl.toString(), {
      method: 'GET',
      headers: fetchHeaders,
      signal: controller.signal,
      redirect: followRedirects ? 'follow' : 'manual',
      // Add CORS mode for cross-origin requests
      mode: 'cors',
    });

    clearTimeout(timeoutId);

    // Handle redirect responses when followRedirects is false
    if (!followRedirects && [301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      throw new Error(`Redirect not followed. Location: ${location}`);
    }

    // Check if response is ok
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('URL not found (404). Please check the URL and try again.');
      } else if (response.status === 403) {
        throw new Error('Access forbidden (403). The server denied access to this resource.');
      } else if (response.status === 500) {
        throw new Error('Server error (500). The remote server encountered an error.');
      } else if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error (${response.status}). Please check the URL and try again.`);
      } else if (response.status >= 500) {
        throw new Error(`Server error (${response.status}). The remote server is experiencing issues.`);
      } else {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
    }

    // Get content type
    const contentType = response.headers.get('content-type');

    // Read response as text first
    const raw = await response.text();

    if (!raw.trim()) {
      throw new Error('The URL returned empty content');
    }

    // Validate content type (warn but don't fail)
    if (contentType && !contentType.includes('application/json') && !contentType.includes('text/')) {
      toast.warning(`Content-Type is "${contentType}". Expected JSON content.`);
    }

    // Try to parse as JSON
    let json: any;
    try {
      json = JSON.parse(raw);
    } catch (parseError) {
      // Check if the content looks like it could be JSON but has syntax errors
      const trimmed = raw.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
          (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        throw new Error('The content appears to be JSON but contains syntax errors. You can use the JSON Repair tool to fix it.');
      } else {
        throw new Error('The URL did not return valid JSON content. Please check the URL and ensure it returns JSON data.');
      }
    }

    return {
      json,
      raw,
      url: validUrl.toString(),
      contentType: contentType || undefined,
    };

  } catch (error) {
    clearTimeout(timeoutId);

    // Handle AbortError (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout / 1000} seconds. The server may be slow or unreachable.`);
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      if (error.message.includes('CORS')) {
        throw new Error('CORS error: The server does not allow cross-origin requests from this domain.');
      } else {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection and the URL.');
      }
    }

    // Re-throw our custom errors
    if (error instanceof Error) {
      throw error;
    }

    // Fallback for unknown errors
    throw new Error('An unexpected error occurred while fetching the URL');
  }
}

export function isValidUrl(url: string): boolean {
  try {
    const validUrl = new URL(url);
    return ['http:', 'https:'].includes(validUrl.protocol);
  } catch {
    return false;
  }
}

export function normalizeUrl(url: string): string {
  if (!url.trim()) return '';
  
  // Add https:// if no protocol is specified
  if (!url.includes('://')) {
    return `https://${url}`;
  }
  
  return url;
}