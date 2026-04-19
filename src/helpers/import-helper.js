import url from 'url';

async function supportsDynamicImport() {
  try {
    // imports are cached.
    // no need to worry about perf here.
    // Don't remove .js: extension must be included for ESM imports!
    await import('./dummy-file.js');
    return true;
  } catch (e) {
    return false;
  }
}

function isPackageInstalled(packageName) {
  try {
    // Try to require the package
    require.resolve(packageName);
    return true;
  } catch (error) {
    // If require.resolve throws an error, the package is not installed
    return false;
  }
}

const isTypescriptProject = isPackageInstalled('typescript');

/**
 * Imports a JSON, CommonJS or ESM module
 * based on feature detection.
 *
 * @param modulePath path to the module to import
 * @returns {Promise<unknown>} the imported module.
 */
async function importModule(modulePath) {
  // JSON modules are still behind a flag. Fallback to require for now.
  // https://nodejs.org/api/esm.html#json-modules
  if (
    url.pathToFileURL &&
    !modulePath.endsWith('.json') &&
    (await supportsDynamicImport())
  ) {
    // 'import' expects a URL. (https://github.com/sequelize/cli/issues/994)
    return import(url.pathToFileURL(modulePath));
  }

  // mimics what `import()` would return for
  // cjs modules.
  return { default: require(modulePath) };
}

module.exports = {
  supportsDynamicImport,
  importModule,
  isPackageInstalled,
  isTypescriptProject,
};
