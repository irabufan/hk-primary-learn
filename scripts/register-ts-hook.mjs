/**
 * Resolve extensionless TypeScript imports and `@/` aliases.
 * Node 22 strips the types itself, so this hook does not transpile.
 */
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * @param {string} specifier
 * @param {{ parentURL?: string }} context
 * @param {(specifier: string, context: { parentURL?: string }) => Promise<unknown>} nextResolve
 */
export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    return resolveAbsolute(path.join(root, specifier.slice(2)), context, nextResolve);
  }
  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    try {
      return await nextResolve(specifier, context);
    } catch {
      const parent = context.parentURL ? fileURLToPath(context.parentURL) : root;
      const abs = path.resolve(path.dirname(parent), specifier);
      return resolveAbsolute(abs, context, nextResolve);
    }
  }
  return nextResolve(specifier, context);
}

/**
 * @param {string} abs
 * @param {{ parentURL?: string }} context
 * @param {(specifier: string, context: { parentURL?: string }) => Promise<unknown>} nextResolve
 */
function resolveAbsolute(abs, context, nextResolve) {
  const fileCandidates = [`${abs}.ts`, `${abs}.tsx`, `${abs}.js`, `${abs}.mjs`, path.join(abs, "index.ts")];
  const candidates =
    existsSync(abs) && statSync(abs).isDirectory() ? fileCandidates : [abs, ...fileCandidates];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return nextResolve(pathToFileURL(candidate).href, context);
    }
  }
  return nextResolve(pathToFileURL(abs).href, context);
}
