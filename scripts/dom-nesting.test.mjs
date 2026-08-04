import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const srcRoot = join(process.cwd(), 'src');

function collectTsxFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectTsxFiles(path);
    return entry.name.endsWith('.tsx') ? [path] : [];
  });
}

function getAccessibilityRole(node, sourceFile) {
  const role = node.openingElement.attributes.properties.find(
    (attribute) => ts.isJsxAttribute(attribute)
      && attribute.name.getText(sourceFile) === 'accessibilityRole',
  );
  if (!role?.initializer) return null;
  if (ts.isStringLiteral(role.initializer)) return role.initializer.text;
  if (!ts.isJsxExpression(role.initializer)) return null;
  const expression = role.initializer.expression;
  return expression && ts.isStringLiteral(expression) ? expression.text : null;
}

describe('web DOM nesting', () => {
  it('does not nest interactive Pressables inside other interactive Pressables', () => {
    const failures = [];

    for (const filePath of collectTsxFiles(srcRoot)) {
      const source = readFileSync(filePath, 'utf8');
      const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

      const visit = (node, insideInteractivePressable) => {
        const isPressable = ts.isJsxElement(node) && node.openingElement.tagName.getText(sourceFile) === 'Pressable';
        const role = isPressable ? getAccessibilityRole(node, sourceFile) : null;
        const isInteractive = isPressable && ['button', 'link', 'tab', 'adjustable'].includes(role ?? '');

        if (isInteractive && insideInteractivePressable) {
          const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
          failures.push(`${filePath}:${position.line + 1}`);
        }

        ts.forEachChild(node, (child) => visit(child, insideInteractivePressable || isInteractive));
      };

      visit(sourceFile, false);
    }

    expect(failures, `Nested interactive Pressables found:\n${failures.join('\n')}`).toEqual([]);
  });
});
