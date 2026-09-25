/*
Reason for existence: Next.js API Route Handler serving real Git repository commits, branch hierarchy, and commit file diffs for the GitKraken Visual Studio.
System impact if absent: GitKraken app cannot fetch real Git commit graph, history, or unified diffs.
*/

import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { GitBranchInfo, GitCommitNode, GitFileDiff, GitRepoData } from '@/types';

const execFileAsync = promisify(execFile);

// Target repository root (SILVESTRIKE/portfolio workspace)
const REPO_ROOT = process.cwd();

interface GitHubCommitResponse {
  sha: string;
  commit: {
    author: { name: string; email: string; date: string };
    message: string;
  };
  parents: Array<{ sha: string }>;
  files?: Array<{ filename: string; status: string; patch?: string }>;
}

async function runGit(args: string[]): Promise<string> {
  const { stdout } = await execFileAsync('git', args, {
    cwd: REPO_ROOT,
    maxBuffer: 10 * 1024 * 1024,
    timeout: 5000
  });
  return stdout.trim();
}

async function fetchFromGitHub(hash?: string): Promise<{ commits?: GitCommitNode[]; diffs?: GitFileDiff[] } | null> {
  try {
    if (hash) {
      const res = await fetch(`https://api.github.com/repos/SILVESTRIKE/portfolio/commits/${hash}`, {
        headers: { 'User-Agent': 'SILVESTRIKE-Portfolio-GitKraken' },
        cache: 'no-store'
      });
      if (!res.ok) return null;
      const data = (await res.json()) as GitHubCommitResponse;
      const diffs: GitFileDiff[] = (data.files || []).map(f => ({
        path: f.filename,
        status: (f.status === 'added' ? 'added' : f.status === 'removed' ? 'deleted' : 'modified') as GitFileDiff['status'],
        diff: f.patch || 'Binary file or large diff omitted'
      }));
      return { diffs };
    }

    const res = await fetch('https://api.github.com/repos/SILVESTRIKE/portfolio/commits?per_page=30', {
      headers: { 'User-Agent': 'SILVESTRIKE-Portfolio-GitKraken' },
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const list = (await res.json()) as GitHubCommitResponse[];
    const commits: GitCommitNode[] = list.map(c => ({
      hash: c.sha,
      shortHash: c.sha.substring(0, 7),
      author: c.commit.author.name || 'SILVESTRIKE',
      email: c.commit.author.email || 'vtduong04@gmail.com',
      date: c.commit.author.date.substring(0, 10),
      relativeTime: 'GitHub Live',
      message: c.commit.message.split('\n')[0],
      parents: c.parents.map(p => p.sha)
    }));
    return { commits };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'repo';
  const hash = searchParams.get('hash');

  // Action: Commit diff inspection
  if (action === 'diff' && hash) {
    // Validate hash to prevent command injection
    if (!/^[a-f0-9]{4,40}$/i.test(hash)) {
      return NextResponse.json({ error: 'Invalid commit hash' }, { status: 400 });
    }

    try {
      // 1. Get changed files with status
      const nameStatusRaw = await runGit(['show', '--name-status', '--oneline', hash]);
      const statusLines = nameStatusRaw.split('\n').slice(1); // skip commit oneline header

      const files: GitFileDiff[] = [];

      for (const line of statusLines) {
        const parts = line.trim().split(/\t+/);
        if (parts.length >= 2) {
          const statusChar = parts[0][0];
          const filePath = parts[1];
          let status: GitFileDiff['status'] = 'modified';
          if (statusChar === 'A') status = 'added';
          else if (statusChar === 'D') status = 'deleted';
          else if (statusChar === 'R') status = 'renamed';

          // Get file patch
          try {
            const filePatch = await runGit(['show', `${hash}`, '--', filePath]);
            files.push({
              path: filePath,
              status,
              diff: filePatch
            });
          } catch {
            files.push({
              path: filePath,
              status,
              diff: 'Unable to render diff'
            });
          }
        }
      }

      return NextResponse.json({ hash, diffs: files });
    } catch {
      // Fallback to GitHub API
      const ghFallback = await fetchFromGitHub(hash);
      if (ghFallback?.diffs) {
        return NextResponse.json({ hash, diffs: ghFallback.diffs });
      }
      return NextResponse.json({ error: 'Commit diff not available' }, { status: 500 });
    }
  }

  // Action: Repo branches and commit history
  try {
    // 1. Get current branch
    let currentBranch = 'main';
    try {
      currentBranch = await runGit(['branch', '--show-current']);
    } catch {
      // Fallback
    }

    // 2. Get branches
    const branchRaw = await runGit(['branch', '-a', '--no-color']);
    const branches: GitBranchInfo[] = branchRaw
      .split('\n')
      .map(b => b.trim())
      .filter(Boolean)
      .map(b => {
        const isCurrent = b.startsWith('*');
        const cleanName = b.replace(/^\*\s*/, '');
        const isRemote = cleanName.startsWith('remotes/');
        return {
          name: cleanName.replace(/^remotes\//, ''),
          isCurrent,
          isRemote,
          commitHash: ''
        };
      });

    // 3. Get commit log with custom pipe format
    const logRaw = await runGit([
      'log',
      '--pretty=format:%H|%h|%an|%ae|%ad|%cr|%s|%P',
      '--date=short',
      '-n',
      '60'
    ]);

    const commits: GitCommitNode[] = logRaw
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const [fullHash, shortHash, author, email, date, relativeTime, message, parentsRaw] = line.split('|');
        return {
          hash: fullHash,
          shortHash: shortHash || fullHash?.substring(0, 7) || '',
          author: author || 'Developer',
          email: email || '',
          date: date || '',
          relativeTime: relativeTime || '',
          message: message || 'Commit update',
          parents: parentsRaw ? parentsRaw.split(' ').filter(Boolean) : []
        };
      });

    const repoData: GitRepoData = {
      repoName: 'SILVESTRIKE/portfolio',
      currentBranch: currentBranch || 'main',
      branches: branches.length > 0 ? branches : [{ name: 'main', isCurrent: true, isRemote: false, commitHash: '' }],
      commits,
      totalCommits: commits.length
    };

    return NextResponse.json(repoData, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=15'
      }
    });
  } catch {
    // Fallback to GitHub public repository API
    const ghData = await fetchFromGitHub();
    if (ghData?.commits) {
      return NextResponse.json({
        repoName: 'SILVESTRIKE/portfolio (GitHub Cloud)',
        currentBranch: 'main',
        branches: [{ name: 'main', isCurrent: true, isRemote: false, commitHash: '' }],
        commits: ghData.commits,
        totalCommits: ghData.commits.length
      });
    }

    return NextResponse.json({ error: 'Failed to read repository data' }, { status: 500 });
  }
}
