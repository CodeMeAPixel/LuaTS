import { TypeScriptParameter } from './types';

export function formatComments(comments: any[]): string {
  if (!comments || comments.length === 0) return '';
  // If any comment is a block, treat as multi-line JSDoc
  if (comments.length === 1 && comments[0].type !== 'Block') {
    return `/** ${comments[0].value.trim()} */`;
  } else {
    return [
      '/**',
      ...comments.map((c: any) =>
        c.value
          .split('\n')
          .map((line: string) => ` * ${line.trim()}`)
          .join('\n')
      ),
      ' */'
    ].join('\n');
  }
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
