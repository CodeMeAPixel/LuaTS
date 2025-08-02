import { TypeScriptParameter } from './types';

export function formatComments(comments: any[]): string {
  if (!comments || comments.length === 0) return '';
  // Flatten all comment values, split by newlines, trim, and filter empty lines
  const lines: string[] = [];
  for (const c of comments) {
    if (!c || typeof c.value !== 'string') continue;
    // Split multiline comments into lines, trim each
    for (const line of c.value.split('\n')) {
      const trimmed = line.trim();
      if (trimmed) lines.push(trimmed);
    }
  }
  if (lines.length === 0) return '';
  if (lines.length === 1) {
    return `/** ${lines[0]} */`;
  }
  return [
    '/**',
    ...lines.map(line => ` * ${line}`),
    ' */'
  ].join('\n');
}

export function getParameters(node: any, getTypeString: (typeNode: any) => string, useUnknown: boolean): TypeScriptParameter[] {
  if (!node || !Array.isArray(node.parameters)) return [];
  // Remove 'self' if it's the first parameter (method)
  return node.parameters
    .filter((p: any, idx: number) => {
      const n = p.name?.name || p.name;
      return !(idx === 0 && n === 'self');
    })
    .map((p: any) => ({
      name: p.name?.name || p.name,
      type: p.typeAnnotation ? getTypeString(p.typeAnnotation.typeAnnotation) : (useUnknown ? 'unknown' : 'any'),
      optional: false,
      description: undefined
    }));
}
