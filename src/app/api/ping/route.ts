/*
Reason for existence: Next.js API Route executing real ICMP network ping against remote hosts or IP addresses with input sanitation and execution timeout.
System impact if absent: NetworkApp diagnostic tool must fall back to simulated random ping latencies.
*/

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Allowed characters: alphanumeric, dots, hyphens
const HOST_REGEX = /^[a-zA-Z0-9.-]+$/;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const host = searchParams.get('host')?.trim() || '1.1.1.1';

  // Sanitize input to prevent command injection
  if (!HOST_REGEX.test(host) || host.length > 64) {
    return NextResponse.json(
      { success: false, error: 'Invalid hostname or IP address format', logs: [] },
      { status: 400 }
    );
  }

  try {
    // Run ping: 3 packets, 2s timeout
    const { stdout, stderr } = await execAsync(`ping -c 3 -W 2 ${host}`, { timeout: 4000 });
    const output = (stdout || stderr).trim();
    const lines = output.split('\n').map(l => l.trim()).filter(Boolean);

    // Extract average RTT if available
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
    // If ping exited with code 1 (packet loss/unreachable), capture stdout
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
