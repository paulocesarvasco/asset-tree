import { describe, expect, test } from 'vitest';
import { AssetTree } from '../candidate/assetTree.js';
import {
  createAsset,
  createComponent,
  createLocation,
  SENSOR_ENERGY,
  SENSOR_VIBRATION,
  STATUS_ALERT,
  STATUS_OPERATING,
} from '../candidate/types.js';

describe('BuildTreeRequiredBehavior', () => {
  test('should nest sub-locations under their parent location', () => {
    const tree = new AssetTree(
      [
        createLocation({ id: 'loc-1', name: 'Plant', parentId: '' }),
        createLocation({ id: 'loc-2', name: 'Line 1', parentId: 'loc-1' }),
      ],
      [],
      [],
    );

    const root = tree.buildTree();
    const parent = root.children.find(node => node.id === 'loc-1');
    expect(parent).toBeDefined();
    expect(parent?.children.map(node => node.id)).toContain('loc-2');
  });

  test('should place orphaned locations at root', () => {
    const tree = new AssetTree(
      [createLocation({ id: 'loc-1', name: 'Detached', parentId: 'missing-location' })],
      [],
      [],
    );

    const root = tree.buildTree();
    expect(root.children.map(node => node.id)).toContain('loc-1');
  });

  test('should place assets under their parent asset before using locationId', () => {
    const tree = new AssetTree(
      [createLocation({ id: 'loc-1', name: 'Plant', parentId: '' })],
      [
        createAsset({ id: 'asset-parent', name: 'Generator', locationId: 'loc-1', parentId: '' }),
        createAsset({ id: 'asset-child', name: 'Motor', locationId: 'loc-1', parentId: 'asset-parent' }),
      ],
      [],
    );

    const root = tree.buildTree();
    const location = root.children.find(node => node.id === 'loc-1');
    const assetParent = location?.children.find(node => node.id === 'asset-parent');

    expect(location).toBeDefined();
    expect(assetParent).toBeDefined();
    expect(assetParent?.children.map(node => node.id)).toContain('asset-child');
  });

  test('should place assets at root when both parentId and locationId are invalid', () => {
    const tree = new AssetTree(
      [],
      [createAsset({ id: 'asset-1', name: 'Orphan Asset', locationId: 'missing-location', parentId: 'missing-asset' })],
      [],
    );

    const root = tree.buildTree();
    expect(root.children.map(node => node.id)).toContain('asset-1');
  });

  test('should place components under valid asset or location parents', () => {
    const tree = new AssetTree(
      [createLocation({ id: 'loc-1', name: 'Plant', parentId: '' })],
      [createAsset({ id: 'asset-1', name: 'Pump', locationId: 'loc-1', parentId: '' })],
      [
        createComponent({
          id: 'comp-1',
          name: 'Sensor A',
          parentId: 'asset-1',
          sensorType: SENSOR_VIBRATION,
          status: STATUS_OPERATING,
        }),
        createComponent({
          id: 'comp-2',
          name: 'Sensor B',
          parentId: 'loc-1',
          sensorType: SENSOR_ENERGY,
          status: STATUS_ALERT,
        }),
      ],
    );

    const root = tree.buildTree();
    const location = root.children.find(node => node.id === 'loc-1');
    const asset = location?.children.find(node => node.id === 'asset-1');

    expect(asset?.children.map(node => node.id)).toContain('comp-1');
    expect(location?.children.map(node => node.id)).toContain('comp-2');
  });

  test('should place orphaned components at root', () => {
    const tree = new AssetTree(
      [],
      [],
      [
        createComponent({
          id: 'comp-1',
          name: 'Loose Sensor',
          parentId: 'missing-parent',
          sensorType: SENSOR_VIBRATION,
          status: STATUS_OPERATING,
        }),
      ],
    );

    const root = tree.buildTree();
    expect(root.children.map(node => node.id)).toContain('comp-1');
  });

  test('should keep components as leaf nodes', () => {
    const tree = new AssetTree(
      [],
      [],
      [
        createComponent({
          id: 'comp-1',
          name: 'Leaf Sensor',
          parentId: '',
          sensorType: SENSOR_VIBRATION,
          status: STATUS_OPERATING,
        }),
      ],
    );

    const root = tree.buildTree();
    const component = root.children.find(node => node.id === 'comp-1');

    expect(component).toBeDefined();
    expect(component?.children).toEqual([]);
  });

  test('should handle location cycles without losing nodes', () => {
    const tree = new AssetTree(
      [
        createLocation({ id: 'loc-1', name: 'A', parentId: 'loc-2' }),
        createLocation({ id: 'loc-2', name: 'B', parentId: 'loc-1' }),
      ],
      [],
      [],
    );

    const root = tree.buildTree();
    expect(root.children.length).toBeGreaterThan(0);
    expect(tree.findNodeById('loc-1')?.id).toBe('loc-1');
    expect(tree.findNodeById('loc-2')?.id).toBe('loc-2');
    expect(tree.getPath('loc-1')[0]?.id).toBe('root');
    expect(tree.getPath('loc-2')[0]?.id).toBe('root');
  });

  test('should rebuild from scratch on repeated buildTree calls', () => {
    const tree = new AssetTree(
      [createLocation({ id: 'loc-1', name: 'Plant', parentId: '' })],
      [createAsset({ id: 'asset-1', name: 'Pump', locationId: 'loc-1', parentId: '' })],
      [],
    );

    const firstRoot = tree.buildTree();
    const secondRoot = tree.buildTree();

    expect(firstRoot.children).toHaveLength(1);
    expect(secondRoot.children).toHaveLength(1);
    expect(secondRoot.children[0]?.children).toHaveLength(1);
  });
});

describe('FindNodeRequiredBehavior', () => {
  test('should return root when searching for root id', () => {
    const tree = new AssetTree([], [], []);
    tree.buildTree();

    expect(tree.findNodeById('root')?.id).toBe('root');
  });

  test('should return undefined for empty ids', () => {
    const tree = new AssetTree([], [], []);
    expect(tree.findNodeById('')).toBeUndefined();
  });

  test('should build on demand before looking up a node', () => {
    const tree = new AssetTree(
      [createLocation({ id: 'loc-1', name: 'Plant', parentId: '' })],
      [],
      [],
    );

    expect(tree.findNodeById('loc-1')?.id).toBe('loc-1');
  });
});

describe('GetPathRequiredBehavior', () => {
  test('should return root-only path for root', () => {
    const tree = new AssetTree([], [], []);
    tree.buildTree();

    expect(tree.getPath('root').map(node => node.id)).toEqual(['root']);
  });

  test('should return the full path from root to a deeply nested node', () => {
    const tree = new AssetTree(
      [
        createLocation({ id: 'loc-1', name: 'Plant', parentId: '' }),
        createLocation({ id: 'loc-2', name: 'Area', parentId: 'loc-1' }),
      ],
      [
        createAsset({ id: 'asset-1', name: 'Pump', locationId: 'loc-2', parentId: '' }),
        createAsset({ id: 'asset-2', name: 'Motor', locationId: 'loc-2', parentId: 'asset-1' }),
      ],
      [
        createComponent({
          id: 'comp-1',
          name: 'Sensor',
          parentId: 'asset-2',
          sensorType: SENSOR_VIBRATION,
          status: STATUS_OPERATING,
        }),
      ],
    );

    tree.buildTree();

    expect(tree.getPath('comp-1').map(node => node.id)).toEqual([
      'root',
      'loc-1',
      'loc-2',
      'asset-1',
      'asset-2',
      'comp-1',
    ]);
  });

  test('should return path to an orphaned node through root', () => {
    const tree = new AssetTree(
      [],
      [createAsset({ id: 'asset-1', name: 'Orphan Asset', locationId: '', parentId: 'missing-parent' })],
      [],
    );

    tree.buildTree();

    expect(tree.getPath('asset-1').map(node => node.id)).toEqual(['root', 'asset-1']);
  });

  test('should return an empty array for missing or empty ids', () => {
    const tree = new AssetTree([], [], []);
    tree.buildTree();

    expect(tree.getPath('missing-node')).toEqual([]);
    expect(tree.getPath('')).toEqual([]);
  });

  test('should build on demand before resolving a path', () => {
    const tree = new AssetTree(
      [createLocation({ id: 'loc-1', name: 'Plant', parentId: '' })],
      [createAsset({ id: 'asset-1', name: 'Pump', locationId: 'loc-1', parentId: '' })],
      [],
    );

    expect(tree.getPath('asset-1').map(node => node.id)).toEqual(['root', 'loc-1', 'asset-1']);
  });
});
