import { pathHelper } from './path-helper';
import { assetsHelper } from './asset-helper';
import { genericHelper } from './generic-helper';
import { importModule } from './import-helper';
import { initHelper } from './init-helper';
import { tableUtils } from './migration-helper';
import { modelHelper } from './model-helper';
import { viewHelper } from './view-helper';
import { versionHelper } from './version-helper';
import { umzugHelper } from './umzug-helper';
import { render } from './template-helper';
import api from './config-helper';

export const helpers = {
  asset: assetsHelper,
  path: pathHelper,
  generic: genericHelper,
  import: { importModule },
  init: initHelper,
  migration: tableUtils,
  model: modelHelper,
  config: api,
  template: { render },
  umzug: umzugHelper,
  version: versionHelper,
  view: viewHelper,
};
