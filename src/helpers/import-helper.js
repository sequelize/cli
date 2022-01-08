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
  if (!modulePath.endsWith('.json') && (await supportsDynamicImport())) {
    return import(modulePath);
  }

  // mimics what `import()` would return for
  // cjs modules.
  return { default: require(modulePath) };
}

module.exports = {
  supportsDynamicImport,
  importModule,
};
