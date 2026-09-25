/*
Reason for existence: Client-side browser and hardware fingerprint generation utility creating deterministic visitor identities for recruiter tracking and access counting.
System impact if absent: The portfolio cannot identify repeat visitors or recruiter organizations across sessions and IP changes.
*/

export interface ClientFingerprintData {
  fingerprint: string;
  screen: string;
  viewport: string;
  language: string;
  timezone: string;
  timezoneOffset: number;
  platform: string;
  cores: number;
  memoryGb?: number;
  webglRenderer?: string;
  webglVendor?: string;
  referrer: string;
  sessionId: string;
}

// 32-bit FNV-1a hash algorithm
function fnv1a(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

// Simple Canvas Fingerprint
function getCanvasFingerprint(): string {
  try {
    if (typeof document === 'undefined') return 'no-canvas';
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-ctx';

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('SILVESTRIKE,dev', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('SILVESTRIKE,dev', 4, 17);

    return fnv1a(canvas.toDataURL());
  } catch {
    return 'canvas-err';
  }
}

// WebGL Vendor and Renderer
function getWebGLInfo(): { vendor?: string; renderer?: string } {
  try {
    if (typeof document === 'undefined') return {};
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (!gl) return {};

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return {};

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    return {
      vendor: typeof vendor === 'string' ? vendor : undefined,
      renderer: typeof renderer === 'string' ? renderer : undefined
    };
  } catch {
    return {};
  }
}

const FP_STORAGE_KEY = 'silves_visitor_fp';
const SESS_STORAGE_KEY = 'silves_session_id';

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'sess-ssr';
  try {
    let sessId = sessionStorage.getItem(SESS_STORAGE_KEY);
    if (!sessId) {
      sessId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem(SESS_STORAGE_KEY, sessId);
    }
    return sessId;
  } catch {
    return `sess-${Date.now()}`;
  }
}

export function generateFingerprint(): ClientFingerprintData {
  if (typeof window === 'undefined') {
    return {
      fingerprint: 'fp_ssr_server',
      screen: '1920x1080',
      viewport: '1920x1080',
      language: 'vi-VN',
      timezone: 'UTC',
      timezoneOffset: 0,
      platform: 'Server',
      cores: 4,
      referrer: '',
      sessionId: 'sess-ssr'
    };
  }

  // Retrieve cached fingerprint if already persisted on device
  let storedFp: string | null = null;
  try {
    storedFp = localStorage.getItem(FP_STORAGE_KEY);
  } catch {
    // LocalStorage may be blocked by privacy extensions
  }

  const screenStr = `${window.screen?.width || 0}x${window.screen?.height || 0}x${window.screen?.colorDepth || 0}`;
  const viewportStr = `${window.innerWidth}x${window.innerHeight}`;
  const langStr = navigator.language || (navigator.languages && navigator.languages[0]) || 'en';
  let tzStr = 'UTC';
  try {
    tzStr = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    // Fallback timezone
  }
  const tzOffset = new Date().getTimezoneOffset();
  const platformStr = navigator.platform || 'Unknown';
  const cores = navigator.hardwareConcurrency || 2;
  const memoryGb = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  const canvasHash = getCanvasFingerprint();
  const webgl = getWebGLInfo();
  const referrer = typeof document !== 'undefined' ? document.referrer : '';
  const sessionId = getOrCreateSessionId();

  let finalFp = storedFp;
  if (!finalFp) {
    const rawTokens = [
      screenStr,
      langStr,
      tzStr,
      tzOffset,
      platformStr,
      cores,
      memoryGb || 0,
      canvasHash,
      webgl.vendor || '',
      webgl.renderer || ''
    ].join('|||');

    const h1 = fnv1a(rawTokens);
    const h2 = fnv1a(rawTokens.split('').reverse().join(''));
    finalFp = `fp_${h1}${h2}`;

    try {
      localStorage.setItem(FP_STORAGE_KEY, finalFp);
    } catch {
      // Ignore storage errors
    }
  }

  return {
    fingerprint: finalFp,
    screen: screenStr,
    viewport: viewportStr,
    language: langStr,
    timezone: tzStr,
    timezoneOffset: tzOffset,
    platform: platformStr,
    cores,
    memoryGb,
    webglRenderer: webgl.renderer,
    webglVendor: webgl.vendor,
    referrer: referrer ? referrer.substring(0, 200) : '',
    sessionId
  };
}

export async function sendVisitorTelemetry(path = '/'): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const fpData = generateFingerprint();
    const payload = {
      path,
      fingerprint: fpData.fingerprint,
      sessionId: fpData.sessionId,
      screen: fpData.screen,
      viewport: fpData.viewport,
      language: fpData.language,
      timezone: fpData.timezone,
      platform: fpData.platform,
      cores: fpData.cores,
      referrer: fpData.referrer,
      webglRenderer: fpData.webglRenderer ? fpData.webglRenderer.substring(0, 100) : undefined
    };

    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    });
  } catch {
    // Fail silently in offline or restricted environments
  }
}
