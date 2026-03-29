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

function makeTree() {
  const tree = new AssetTree(
    [
      createLocation({ id: 'loc-1', name: 'Plant', parentId: '' }),
      createLocation({ id: 'loc-2', name: 'Area A', parentId: 'loc-1' }),
      createLocation({ id: 'loc-3', name: 'Area B', parentId: 'loc-1' }),
    ],
    [
      createAsset({ id: 'asset-1', name: 'Pump', locationId: 'loc-2', parentId: '' }),
      createAsset({ id: 'asset-2', name: 'Motor', locationId: 'loc-2', parentId: 'asset-1' }),
      createAsset({ id: 'asset-3', name: 'Compressor', locationId: 'loc-3', parentId: '' }),
    ],
    [
      createComponent({
        id: 'comp-1',
        name: 'Vibration Sensor',
        parentId: 'asset-2',
        sensorType: SENSOR_VIBRATION,
        status: STATUS_OPERATING,
      }),
      createComponent({
        id: 'comp-2',
        name: 'Energy Sensor',
        parentId: 'loc-2',
        sensorType: SENSOR_ENERGY,
        status: STATUS_ALERT,
      }),
    ],
  );

  tree.buildTree();
  return tree;
}

describe('MoveNodeBehavior', () => {
  test('should move a location under another location', () => {
    const tree = makeTree();

    const moved = tree.moveNode('loc-3', 'loc-2');

    expect(moved).toBe(true);
    expect(tree.getPath('loc-3').map(node => node.id)).toEqual(['root', 'loc-1', 'loc-2', 'loc-3']);
    expect(tree.locations.find(location => location.id === 'loc-3')?.parentId).toBe('loc-2');
  });

  test('should move an asset under a location', () => {
    const tree = makeTree();

    const moved = tree.moveNode('asset-1', 'loc-3');

    expect(moved).toBe(true);
    expect(tree.getPath('asset-1').map(node => node.id)).toEqual(['root', 'loc-1', 'loc-3', 'asset-1']);
    expect(tree.assets.find(asset => asset.id === 'asset-1')).toMatchObject({
      id: 'asset-1',
      parentId: '',
      locationId: 'loc-3',
    });
  });

  test('should move an asset under another asset and update canonical parent fields', () => {
    const tree = makeTree();

    const moved = tree.moveNode('asset-3', 'asset-1');

    expect(moved).toBe(true);
    expect(tree.getPath('asset-3').map(node => node.id)).toEqual([
      'root',
      'loc-1',
      'loc-2',
      'asset-1',
      'asset-3',
    ]);
    expect(tree.assets.find(asset => asset.id === 'asset-3')).toMatchObject({
      id: 'asset-3',
      parentId: 'asset-1',
      locationId: 'loc-2',
    });
  });

  test('should move a component under a location or asset', () => {
    const tree = makeTree();

    expect(tree.moveNode('comp-1', 'loc-3')).toBe(true);
    expect(tree.getPath('comp-1').map(node => node.id)).toEqual(['root', 'loc-1', 'loc-3', 'comp-1']);
    expect(tree.components.find(component => component.id === 'comp-1')?.parentId).toBe('loc-3');

    expect(tree.moveNode('comp-2', 'asset-3')).toBe(true);
    expect(tree.getPath('comp-2').map(node => node.id)).toEqual([
      'root',
      'loc-1',
      'loc-3',
      'asset-3',
      'comp-2',
    ]);
    expect(tree.components.find(component => component.id === 'comp-2')?.parentId).toBe('asset-3');
  });

  test('should move nodes to root when newParentId is root or empty', () => {
    const tree = makeTree();

    expect(tree.moveNode('loc-2', 'root')).toBe(true);
    expect(tree.getPath('loc-2').map(node => node.id)).toEqual(['root', 'loc-2']);
    expect(tree.locations.find(location => location.id === 'loc-2')?.parentId).toBe('');

    expect(tree.moveNode('asset-1', '')).toBe(true);
    expect(tree.getPath('asset-1').map(node => node.id)).toEqual(['root', 'asset-1']);
    expect(tree.assets.find(asset => asset.id === 'asset-1')).toMatchObject({
      id: 'asset-1',
      parentId: '',
      locationId: '',
    });
  });

  test('should return false for invalid parents or missing nodes', () => {
    const tree = makeTree();

    expect(tree.moveNode('missing-node', 'loc-1')).toBe(false);
    expect(tree.moveNode('asset-1', 'missing-parent')).toBe(false);
    expect(tree.moveNode('loc-2', 'asset-1')).toBe(false);
    expect(tree.moveNode('asset-1', 'comp-1')).toBe(false);
    expect(tree.moveNode('comp-1', 'comp-2')).toBe(false);
  });

  test('should prevent cycles by disallowing moves under descendants', () => {
    const tree = makeTree();

    expect(tree.moveNode('loc-1', 'loc-2')).toBe(false);
    expect(tree.moveNode('asset-1', 'asset-2')).toBe(false);
    expect(tree.getPath('asset-2').map(node => node.id)).toEqual([
      'root',
      'loc-1',
      'loc-2',
      'asset-1',
      'asset-2',
    ]);
  });

  test('should return false when moving root', () => {
    const tree = makeTree();

    expect(tree.moveNode('root', 'loc-1')).toBe(false);
  });
});
