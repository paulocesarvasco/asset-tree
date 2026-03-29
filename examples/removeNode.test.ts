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
      createLocation({ id: 'loc-2', name: 'Area', parentId: 'loc-1' }),
    ],
    [
      createAsset({ id: 'asset-1', name: 'Pump', locationId: 'loc-2', parentId: '' }),
      createAsset({ id: 'asset-2', name: 'Motor', locationId: 'loc-2', parentId: 'asset-1' }),
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

describe('RemoveNodeBehavior', () => {
  test('should remove a leaf component from the tree and backing list', () => {
    const tree = makeTree();

    const removed = tree.removeNode('comp-2');

    expect(removed).toBe(true);
    expect(tree.findNodeById('comp-2')).toBeUndefined();
    expect(tree.components.map(component => component.id)).toEqual(['comp-1']);
    expect(tree.getPath('comp-2')).toEqual([]);
  });

  test('should remove a subtree and all descendants from backing lists', () => {
    const tree = makeTree();

    const removed = tree.removeNode('loc-2');

    expect(removed).toBe(true);
    expect(tree.findNodeById('loc-2')).toBeUndefined();
    expect(tree.findNodeById('asset-1')).toBeUndefined();
    expect(tree.findNodeById('asset-2')).toBeUndefined();
    expect(tree.findNodeById('comp-1')).toBeUndefined();
    expect(tree.findNodeById('comp-2')).toBeUndefined();
    expect(tree.locations.map(location => location.id)).toEqual(['loc-1']);
    expect(tree.assets).toHaveLength(0);
    expect(tree.components).toHaveLength(0);
  });

  test('should remove an asset subtree without affecting sibling nodes', () => {
    const tree = makeTree();

    const removed = tree.removeNode('asset-1');

    expect(removed).toBe(true);
    expect(tree.findNodeById('asset-1')).toBeUndefined();
    expect(tree.findNodeById('asset-2')).toBeUndefined();
    expect(tree.findNodeById('comp-1')).toBeUndefined();
    expect(tree.findNodeById('comp-2')?.id).toBe('comp-2');
    expect(tree.getPath('comp-2').map(node => node.id)).toEqual(['root', 'loc-1', 'loc-2', 'comp-2']);
  });

  test('should return false when removing root', () => {
    const tree = makeTree();

    expect(tree.removeNode('root')).toBe(false);
    expect(tree.findNodeById('loc-1')?.id).toBe('loc-1');
  });

  test('should return false for missing ids', () => {
    const tree = makeTree();

    expect(tree.removeNode('missing-node')).toBe(false);
    expect(tree.locations).toHaveLength(2);
    expect(tree.assets).toHaveLength(2);
    expect(tree.components).toHaveLength(2);
  });
});
