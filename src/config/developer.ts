/*
Reason for existence: Central source of truth for developer personal information, educational credentials, contact channels, and career status.
System Impact of Absence: Components, views, terminal commands, and metadata will fall back to out-of-sync, hardcoded strings across the codebase.
*/

export const DEVELOPER_CONFIG = {
  name: 'Van Trong Duong',
  alias: 'SILVESTRIKE',
  username: 'duong',
  title: 'Full-Stack Developer | AI Engineer',
  targetRoles: 'Open for Software Engineer / AI Engineer Roles',
  status: 'Open for Hire',
  location: 'Ho Chi Minh City, Vietnam',
  birthYear: 2004,
  age: 22,

  contact: {
    email: 'vtduong04@gmail.com',
    github: 'https://github.com/SILVESTRIKE',
    githubUsername: 'SILVESTRIKE',
    facebook: 'https://fb.com/hakudevon',
    facebookDisplay: 'fb.com/hakudevon'
  },

  education: {
    university: {
      full: 'Ho Chi Minh city University of Industry and Trade (HUIT)',
      short: 'HUIT',
      formal: 'Ho Chi Minh City University of Industry and Trade (HUIT)'
    },
    degree: {
      full: 'Bachelor Engineer in IT',
      short: 'B.Eng in IT',
      formal: 'Bachelor of Engineering in Information Technology'
    },
    major: 'Information Technology',
    gpa: '3.4 / 4.0',
    gpaScore: 3.4,
    gpaScale: 4.0,
    ielts: '6.5 Academic',
    timeline: '2022 - 2026',
    timelineFull: '2022 - 2026'
  },

  philosophy: [
    'Clean Architecture & strictly decoupled services over ad-hoc scripts',
    'High test coverage with clear bounded contexts and validation schemas',
    'Bridging deep learning models with high-throughput production infrastructure'
  ]
} as const;
