import url from 'url';

export async function supportsDynamicImport(): Promise<boolean> {
  try {
    // imports are cached.
    // no need to worry about perf here.
    // Don't remove .js: extension must be included for ESM imports!
    await import('./dummy-file');
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Imports a JSON, CommonJS or ESM module
 * based on feature detection.
 *
 * @param modulePath path to the module to import
 * @returns {Promise<unknown>} the imported module.
 */
export async function importModule(modulePath: string): Promise<unknown> {
  // JSON modules are still behind a flag. Fallback to require for now.
  // https://nodejs.org/api/esm.html#json-modules
  if (
    url.pathToFileURL &&
    !modulePath.endsWith('.json') &&
    (await supportsDynamicImport())
  ) {
    // 'import' expects a URL. (https://github.com/sequelize/cli/issues/994)
    return import(modulePath);
  }

  // mimics what `import()` would return for
  // cjs modules.
  return { default: require(modulePath) };
}
