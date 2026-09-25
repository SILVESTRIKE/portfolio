/*
Reason for existence: Aggregator exporting complete English localization dictionary modules across all application domains.
System impact if absent: Application components will not be able to load English locale as a unified dictionary.
*/

import { enCommon } from './common';
import { enPanel } from './panel';
import { enDock } from './dock';
import { enCommands } from './commands';
import { enWorkspace } from './workspace';

export const enLocale = {
  common: enCommon,
  panel: enPanel,
  dock: enDock,
  commands: enCommands,
  workspace: enWorkspace
};
