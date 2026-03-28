/**
 * Basic example tests — these verify your setup works.
 *
 * The full evaluation suite has many more tests. These are just to get you started.
 *
 * IMPORTANT: Keep the directory structure as-is when pushing to GitHub.
 * Your repo root must contain a `candidate/` folder with your solution file inside.
 */

import { describe, test, expect } from 'vitest';
import { AssetTree } from '../candidate/assetTree.js';
import {
  createLocation,
  createAsset,
  createComponent,
  SENSOR_VIBRATION,
  SENSOR_ENERGY,
  STATUS_OPERATING,
  STATUS_ALERT,
} from '../candidate/types.js';

// Simple dataset:
// Root
// └── Location A
//     └── Asset 1
//         ├── Component A1 (vibration, operating)
//         └── Component A2 (energy, alert)

const LOCATIONS = [createLocation({ id: 'locA', name: 'Location A', parentId: '' })];
const ASSETS = [createAsset({ id: 'asset1', name: 'Asset 1', locationId: 'locA', parentId: '' })];
const COMPONENTS = [
  createComponent({ id: 'compA1', name: 'Component A1', parentId: 'asset1', sensorType: SENSOR_VIBRATION, status: STATUS_OPERATING }),
  createComponent({ id: 'compA2', name: 'Component A2', parentId: 'asset1', sensorType: SENSOR_ENERGY, status: STATUS_ALERT }),
];

function makeTree() {
  const tree = new AssetTree([...LOCATIONS], [...ASSETS], [...COMPONENTS]);
  tree.buildTree();
  return tree;
}

describe('BuildTreeBasic', () => {
  test('should build tree with root', () => {
    const tree = makeTree();
    const root = tree.buildTree();
    expect(root).toBeDefined();
    expect(root.id).toBe('root');
    expect(root.children).toBeDefined();
    expect(root.children.length).toBeGreaterThan(0);
  });

  test('should place location under root', () => {
    const tree = makeTree();
    const root = tree.buildTree();
    const locIds = root.children.map(c => c.id);
    expect(locIds).toContain('locA');
  });
});

describe('FindNodeBasic', () => {
  test('should find existing node', () => {
    const tree = makeTree();
    const node = tree.findNodeById('asset1');
    expect(node).toBeDefined();
    expect(node!.id).toBe('asset1');
  });

  test('should return undefined for missing node', () => {
    const tree = makeTree();
    const node = tree.findNodeById('nonexistent');
    expect(node).toBeUndefined();
  });
});

describe('GetPathBasic', () => {
  test('should return path to component', () => {
    const tree = makeTree();
    const path = tree.getPath('compA1');
    expect(path.length).toBeGreaterThanOrEqual(2);
    expect(path[0].id).toBe('root');
    expect(path[path.length - 1].id).toBe('compA1');
  });
});
