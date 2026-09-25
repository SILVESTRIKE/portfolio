/*
Reason for existence: Aggregator exporting complete Vietnamese localization dictionary modules across all application domains.
System impact if absent: Application components will not be able to load Vietnamese locale as a unified dictionary.
*/

import { viCommon } from './common';
import { viPanel } from './panel';
import { viDock } from './dock';
import { viCommands } from './commands';
import { viWorkspace } from './workspace';

export const viLocale = {
  common: viCommon,
  panel: viPanel,
  dock: viDock,
  commands: viCommands,
  workspace: viWorkspace
};
