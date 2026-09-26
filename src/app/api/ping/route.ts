/*
Reason for existence: Next.js API Route executing ICMP network ping against public destinations with strict SSRF defense.
System impact if absent: NetworkApp ping tool will lack live latency diagnostic capabilities.
*/

import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// Allowed characters: must start and end with alphanumeric, dots and hyphens allowed inside
const HOST_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?$/;

function isPrivateHost(host: string): boolean {
  const lower = host.toLowerCase();
  if (
    lower === 'localhost' ||
    lower.endsWith('.local') ||
    lower.endsWith('.internal') ||
    lower.endsWith('.lan') ||
    lower.endsWith('.home') ||
    lower === '0.0.0.0'
  ) {
    return true;
  }

  const ipv4Match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const oct1 = parseInt(ipv4Match[1], 10);
    const oct2 = parseInt(ipv4Match[2], 10);

    // 127.0.0.0/8 (Loopback)
    if (oct1 === 127) return true;
    // 10.0.0.0/8 (Private network)
    if (oct1 === 10) return true;
    // 172.16.0.0/12 (Private network)
    if (oct1 === 172 && oct2 >= 16 && oct2 <= 31) return true;
    // 192.168.0.0/16 (Private network)
    if (oct1 === 192 && oct2 === 168) return true;
    // 169.254.0.0/16 (Link-local / Cloud metadata endpoint)
    if (oct1 === 169 && oct2 === 254) return true;
    // 0.0.0.0/8 or Reserved
    if (oct1 === 0 || oct1 >= 224) return true;
  }

  return false;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const host = searchParams.get('host')?.trim() || '1.1.1.1';

  // Sanitize input format
  if (!HOST_REGEX.test(host) || host.length > 64) {
    return NextResponse.json(
      { success: false, error: 'Invalid hostname or IP address format', logs: [] },
      { status: 400 }
    );
  }

  // Strict SSRF defense: block any LAN / internal scanning
  if (isPrivateHost(host)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Destination blocked: Internal LAN and loopback scanning prohibited.',
        logs: [
          '[SECURITY GUARD] Attempted probe to private/internal network destination was blocked.',
          `Target ${host} is restricted.`
        ]
      },
      { status: 403 }
    );
  }

  try {
    // Run ping: 3 packets, 2s timeout using array args (zero shell invocation)
    const { stdout, stderr } = await execFileAsync('ping', ['-c', '3', '-W', '2', host], { timeout: 4000 });
    const output = (stdout || stderr).trim();
    const lines = output.split('\n').map(l => l.trim()).filter(Boolean);

    let avgMs: number | null = null;
    const rttMatch = output.match(/(?:rtt|round-trip) min\/avg\/max\/(?:mdev|stddev) = [0-9.]+\/([0-9.]+)\//i);
    if (rttMatch && rttMatch[1]) {
      avgMs = parseFloat(rttMatch[1]);
    }

    return NextResponse.json({
      success: true,
      host,
      logs: lines,
      avgMs
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const execErr = err as { stdout?: string; stderr?: string };
    const rawOut = (execErr.stdout || execErr.stderr || errorMsg).trim();
    const lines = rawOut.split('\n').map(l => l.trim()).filter(Boolean);

    return NextResponse.json({
      success: false,
      host,
      logs: lines.length > 0 ? lines : [`Ping to ${host} failed or timed out.`],
      avgMs: null
    });
  }
}
