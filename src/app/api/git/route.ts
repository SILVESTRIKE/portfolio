/*
Reason for existence: Next.js API Route Handler serving real Git repository commits, branch hierarchy, commit file diffs, and multi-rGithing for the GitKraken Visual Studio.
System impact if absent: Git app cannot fetch Git commit graph, switch repositories, or inspect unified diffs.
*/

import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { GitBranchInfo, GitCommitNode, GitFileDiff, GitRepoData, GitRepoItem } from '@/types';

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

interface GitHubBranchResponse {
  name: string;
  commit: { sha: string };
}

interface GitHubRepoResponse {
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  private?: boolean;
  visibility?: string;
}

// In-memory caching to avoid GitHub rate limits (60 req/hr unauthenticated)
let reposCache: { data: GitRepoItem[]; timestamp: number } | null = null;
const commitsCache = new Map<string, { data: GitRepoData; timestamp: number }>();
const diffsCache = new Map<string, { data: GitFileDiff[]; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute

const DEFAULT_FALLBACK_REPOS: GitRepoItem[] = [
  {
    name: 'portfolio',
    fullName: 'SILVESTRIKE/portfolio',
    description: 'SILVESTRIKE Portfolio OS - Linux Hyprland WebOS Desktop',
    language: 'TypeScript',
    stars: 5,
    forks: 1,
    isLocal: true
  },
  {
    name: 'samco-binhtan-webapp',
    fullName: 'SILVESTRIKE/samco-binhtan-webapp',
    description: 'Samco VinFast EV Automobile Sales CMS & Commerce Platform',
    language: 'TypeScript',
    stars: 3,
    forks: 0,
    isLocal: false
  },
  {
    name: 'DogDexx',
    fullName: 'SILVESTRIKE/DogDexx',
    description: 'Dog breed recognition AI classifier platform with PyTorch & Next.js',
    language: 'TypeScript',
    stars: 4,
    forks: 1,
    isLocal: false
  },
  {
    name: 'Inkwell',
    fullName: 'SILVESTRIKE/Inkwell',
    description: 'Modern Markdown Note Taking & Document Workspace',
    language: 'TypeScript',
    stars: 2,
    forks: 0,
    isLocal: false
  },
  {
    name: 'tuoitre_clone',
    fullName: 'SILVESTRIKE/tuoitre_clone',
    description: 'News portal clone with real-time news scraping & CMS',
    language: 'JavaScript',
    stars: 2,
    forks: 0,
    isLocal: false
  },
  {
    name: 'PhanMemQuanLyQuanCaPhe',
    fullName: 'SILVESTRIKE/PhanMemQuanLyQuanCaPhe',
    description: 'Coffee shop point of sale & inventory management system',
    language: 'C#',
    stars: 3,
    forks: 0,
    isLocal: false
  },
  {
    name: 'Toi_Uu_Gia',
    fullName: 'SILVESTRIKE/Toi_Uu_Gia',
    description: 'Pricing optimization algorithmic models & revenue management',
    language: 'Python',
    stars: 2,
    forks: 0,
    isLocal: false
  },
  {
    name: 'WebBanSach',
    fullName: 'SILVESTRIKE/WebBanSach',
    description: 'Online Bookstore E-commerce fullstack web application',
    language: 'Java',
    stars: 2,
    forks: 0,
    isLocal: false
  },
  {
    name: 'DanhGiaCamXuc',
    fullName: 'SILVESTRIKE/DanhGiaCamXuc',
    description: 'Vietnamese Sentiment Analysis deep learning model',
    language: 'Python',
    stars: 1,
    forks: 0,
    isLocal: false
  },
  {
    name: 'HoverController',
    fullName: 'SILVESTRIKE/HoverController',
    description: 'Computer vision hand-gesture tracking controller',
    language: 'Python',
    stars: 2,
    forks: 0,
    isLocal: false
  }
];

async function runGit(args: string[]): Promise<string> {
  const { stdout } = await execFileAsync('git', args, {
    cwd: REPO_ROOT,
    maxBuffer: 10 * 1024 * 1024,
    timeout: 5000
  });
  return stdout.trim();
}

function sanitizeRepoName(repoParam: string | null): string {
  if (!repoParam) return 'SILVESTRIKE/portfolio';
  const clean = repoParam.trim().replace(/^['"]|['"]$/g, '');
  if (clean.includes('/')) {
    const parts = clean.split('/');
    return `${parts[0]}/${parts[1]}`;
  }
  return `SILVESTRIKE/${clean}`;
}

async function fetchUserRepos(): Promise<GitRepoItem[]> {
  const now = Date.now();
  if (reposCache && now - reposCache.timestamp < CACHE_TTL_MS) {
    return reposCache.data;
  }

  try {
    const res = await fetch('https://api.github.com/users/SILVESTRIKE/repos?per_page=100&sort=updated', {
      headers: {
        'User-Agent': 'SILVESTRIKE-Portfolio-GitKraken',
        Accept: 'application/vnd.github.v3+json'
      },
      next: { revalidate: 60 }
    });

    if (res.ok) {
      const data = (await res.json()) as GitHubRepoResponse[];
      const publicOnly = data.filter(
        (r) => !r.private && r.visibility !== 'private' && r.visibility !== 'internal'
      );
      const mapped: GitRepoItem[] = publicOnly.map((r) => ({
        name: r.name,
        fullName: r.full_name,
        description: r.description || 'Public repository by SILVESTRIKE',
        language: r.language || 'Code',
        stars: r.stargazers_count,
        forks: r.forks_count,
        updatedAt: r.updated_at,
        isLocal: r.full_name === 'SILVESTRIKE/portfolio'
      }));

      // Ensure local portfolio is at the very top
      const sorted = [
        ...mapped.filter((r) => r.isLocal),
        ...mapped.filter((r) => !r.isLocal)
      ];

      reposCache = { data: sorted, timestamp: now };
      return sorted;
    }
  } catch {
    // Keep fallback
  }

  return DEFAULT_FALLBACK_REPOS;
}

async function fetchGitHubRepoData(
  targetRepo: string,
  branch?: string
): Promise<GitRepoData | null> {
  const cacheKey = `${targetRepo}:${branch || 'default'}`;
  const now = Date.now();
  const cached = commitsCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    // 0. Privacy guard: verify repository is strictly public before exposing commits
    const metaRes = await fetch(`https://api.github.com/repos/${targetRepo}`, {
      headers: {
        'User-Agent': 'SILVESTRIKE-Portfolio-GitKraken',
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (!metaRes.ok) {
      // 404/403: repo is either private or does not exist
      return null;
    }

    const meta = (await metaRes.json()) as GitHubRepoResponse;
    if (meta.private || meta.visibility === 'private' || meta.visibility === 'internal') {
      // Strictly refuse to serve private repositories
      return null;
    }

    // 1. Fetch branches
    const branchRes = await fetch(`https://api.github.com/repos/${targetRepo}/branches?per_page=30`, {
      headers: {
        'User-Agent': 'SILVESTRIKE-Portfolio-GitKraken',
        Accept: 'application/vnd.github.v3+json'
      }
    });

    let branches: GitBranchInfo[] = [];
    let currentBranch = branch || 'main';

    if (branchRes.ok) {
      const branchList = (await branchRes.json()) as GitHubBranchResponse[];
      branches = branchList.map((b) => ({
        name: b.name,
        isCurrent: b.name === currentBranch || (!branch && (b.name === 'main' || b.name === 'master')),
        isRemote: false,
        commitHash: b.commit?.sha || ''
      }));
      const foundCurrent = branches.find((b) => b.isCurrent);
      if (foundCurrent) {
        currentBranch = foundCurrent.name;
      } else if (branches.length > 0) {
        currentBranch = branches[0].name;
        branches[0].isCurrent = true;
      }
    }

    // 2. Fetch commits for branch
    const commitUrl = `https://api.github.com/repos/${targetRepo}/commits?sha=${encodeURIComponent(
      currentBranch
    )}&per_page=35`;
    const commitRes = await fetch(commitUrl, {
      headers: {
        'User-Agent': 'SILVESTRIKE-Portfolio-GitKraken',
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (commitRes.ok) {
      const commitList = (await commitRes.json()) as GitHubCommitResponse[];
      const commits: GitCommitNode[] = commitList.map((c) => ({
        hash: c.sha,
        shortHash: c.sha.substring(0, 7),
        author: c.commit.author.name || 'SILVESTRIKE',
        email: c.commit.author.email || 'vtduong04@gmail.com',
        date: c.commit.author.date.substring(0, 10),
        relativeTime: 'GitHub Cloud',
        message: c.commit.message.split('\n')[0],
        parents: c.parents.map((p) => p.sha)
      }));

      const repoData: GitRepoData = {
        repoName: targetRepo,
        currentBranch,
        branches: branches.length > 0 ? branches : [{ name: currentBranch, isCurrent: true, isRemote: false, commitHash: '' }],
        commits,
        totalCommits: commits.length,
        isReadOnly: true
      };

      commitsCache.set(cacheKey, { data: repoData, timestamp: now });
      return repoData;
    }
  } catch {
    // Fallback
  }

  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'repo';
  const targetRepo = sanitizeRepoName(searchParams.get('repo'));
  const hash = searchParams.get('hash');
  const branch = searchParams.get('branch') || undefined;

  // ----------------------------------------------------
  // Action: List all available repositories
  // ----------------------------------------------------
  if (action === 'repos' || action === 'list_repos') {
    const repos = await fetchUserRepos();
    return NextResponse.json({ repos });
  }

  // ----------------------------------------------------
  // Action: Commit diff inspection
  // ----------------------------------------------------
  if (action === 'diff' && hash) {
    if (!/^[a-f0-9]{4,40}$/i.test(hash)) {
      return NextResponse.json({ error: 'Invalid commit hash' }, { status: 400 });
    }

    const diffKey = `${targetRepo}:${hash}`;
    const cachedDiff = diffsCache.get(diffKey);
    if (cachedDiff && Date.now() - cachedDiff.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ hash, diffs: cachedDiff.data });
    }

    // Try local git if target is local portfolio workspace
    if (targetRepo === 'SILVESTRIKE/portfolio') {
      try {
        const nameStatusRaw = await runGit(['show', '--name-status', '--oneline', hash]);
        const statusLines = nameStatusRaw.split('\n').slice(1);

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

            try {
              const filePatch = await runGit(['show', hash, '--', filePath]);
              files.push({ path: filePath, status, diff: filePatch });
            } catch {
              files.push({ path: filePath, status, diff: 'Unable to render diff' });
            }
          }
        }

        diffsCache.set(diffKey, { data: files, timestamp: Date.now() });
        return NextResponse.json({ hash, diffs: files });
      } catch {
        // Fall back to GitHub API
      }
    }

    // Fetch diff from GitHub API for any repository
    try {
      const res = await fetch(`https://api.github.com/repos/${targetRepo}/commits/${hash}`, {
        headers: {
          'User-Agent': 'SILVESTRIKE-Portfolio-GitKraken',
          Accept: 'application/vnd.github.v3+json'
        }
      });

      if (res.ok) {
        const data = (await res.json()) as GitHubCommitResponse;
        const diffs: GitFileDiff[] = (data.files || []).map((f) => ({
          path: f.filename,
          status: (f.status === 'added'
            ? 'added'
            : f.status === 'removed'
              ? 'deleted'
              : 'modified') as GitFileDiff['status'],
          diff: f.patch || `File ${f.status}: ${f.filename}`
        }));

        diffsCache.set(diffKey, { data: diffs, timestamp: Date.now() });
        return NextResponse.json({ hash, diffs });
      }
    } catch {
      // Fallback below
    }

    return NextResponse.json({ error: 'Commit diff not available' }, { status: 500 });
  }

  // ----------------------------------------------------
  // Action: Repo branches and commit history
  // ----------------------------------------------------
  // If target is local portfolio workspace, prioritize local git CLI
  if (targetRepo === 'SILVESTRIKE/portfolio') {
    try {
      let currentBranch = 'main';
      try {
        currentBranch = await runGit(['branch', '--show-current']);
      } catch { }

      const branchRaw = await runGit(['branch', '-a', '--no-color']);
      const branches: GitBranchInfo[] = branchRaw
        .split('\n')
        .map((b) => b.trim())
        .filter(Boolean)
        .map((b) => {
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

      const logRaw = await runGit([
        'log',
        '--pretty=format:%H|%h|%an|%ae|%ad|%cr|%s|%P',
        '--date=short',
        '-n',
        '60'
      ]);

      const commits: GitCommitNode[] = logRaw
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [fullHash, shortHash, author, email, date, relativeTime, message, parentsRaw] =
            line.split('|');
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
        branches:
          branches.length > 0
            ? branches
            : [{ name: 'main', isCurrent: true, isRemote: false, commitHash: '' }],
        commits,
        totalCommits: commits.length,
        isReadOnly: false
      };

      return NextResponse.json(repoData, {
        headers: {
          'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=15'
        }
      });
    } catch {
      // Fall through to GitHub API
    }
  }

  // Fetch target repository from GitHub Cloud API
  const cloudData = await fetchGitHubRepoData(targetRepo, branch);
  if (cloudData) {
    return NextResponse.json(cloudData, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30'
      }
    });
  }

  return NextResponse.json(
    { error: `Failed to read repository data for ${targetRepo}` },
    { status: 500 }
  );
}
