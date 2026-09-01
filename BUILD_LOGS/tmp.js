export function findDescriptorChildrenImports(source, id) {
  let ast
  try {
    ast = source && typeof source === 'object' ? source : parseModule(source, id)
  } catch {
    return []
  }
  const importedBindings = new Map()
  for (const node of ast.body || []) {
    if (node.type !== 'ImportDeclaration' || node.importKind === 'type') continue
    for (const specifier of node.specifiers || []) {
      if (specifier.type === 'ImportSpecifier') {
        importedBindings.set(specifier.local.name, {
          request: node.source.value,
          imported: specifier.imported?.name ?? specifier.imported?.value
        })
      } else if (specifier.type === 'ImportDefaultSpecifier') {
        importedBindings.set(specifier.local.name, {
          request: node.source.value,
          imported: 'default'
        })
      }
    }
  }
  const jsxBindings = new Set()
  const visited = new WeakSet()
  const pending = [ast]
  while (pending.length > 0) {
    const value = pending.pop()
    if (value === null || typeof value !== 'object' || visited.has(value)) continue
    visited.add(value)
    // Match void-import discovery: JSX tags use openingElement.name
    // (JSXIdentifier), while TSRX Element nodes expose the tag as id/name
    // (Identifier). Only JSXOpeningElement/JSXIdentifier missed the latter.
    if (value.type === 'JSXElement' || value.type === 'Element') {
      const tag = value.openingElement?.name || value.id || value.name
      if (tag?.type === 'Identifier' || tag?.type === 'JSXIdentifier') {
        jsxBindings.add(tag.name)
      }
    }
    for (const [key, child] of Object.entries(value)) {
      if (key === 'loc' || key === 'metadata') continue
      if (Array.isArray(child)) pending.push(...child)
      else pending.push(child)
    }
  }
  const candidates = []
  for (const [local, imported] of importedBindings) {
    if (jsxBindings.has(local)) candidates.push({ ...imported, local })
  }
  for (const node of ast.body || []) {
    if (node.type !== 'ExportNamedDeclaration') continue
    for (const specifier of node.specifiers || []) {
      const exported = specifier.exported?.name ?? specifier.exported?.value
      if (node.source?.value) {
        candidates.push({
          request: node.source.value,
          imported: specifier.local?.name ?? specifier.local?.value,
          exported
        })
        continue
      }
      const imported = importedBindings.get(specifier.local?.name)
      if (imported !== undefined) candidates.push({ ...imported, exported })
    }
  }
  return candidates
}
