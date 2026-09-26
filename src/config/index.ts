/*
Reason for existence: Central index re-exporting developer profile and WebOS system configurations for uniform import across the app.
System Impact of Absence: Consuming components must import from fragmented submodules instead of a unified `@/config` entry point.
*/

export * from './developer';
export * from './system';
