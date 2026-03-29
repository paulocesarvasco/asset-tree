import { describe, expect, test } from 'vitest';
import { AssetTree } from '../candidate/assetTree.js';
import {
  createAsset,
  createComponent,
  createLocation,
  NODE_TYPE_ASSET,
  NODE_TYPE_COMPONENT,
  NODE_TYPE_LOCATION,
  SENSOR_ENERGY,
  STATUS_ALERT,
} from '../candidate/types.js';

describe('AddNodeBehavior', () => {
  test('should add a root-level location and update the backing list', () => {
    const tree = new AssetTree([], [], []);

    const [node, error] = tree.addNode(createLocation({
      id: 'loc-1',
      name: 'Plant',
      parentId: '',
    }));

    expect(error).toBeUndefined();
    expect(node?.id).toBe('loc-1');
    expect(node?.type).toBe(NODE_TYPE_LOCATION);
    expect(tree.locations.map(location => location.id)).toEqual(['loc-1']);
    expect(tree.root.children.map(child => child.id)).toContain('loc-1');
  });

  test('should add a sub-location under an existing location parent', () => {
    const tree = new AssetTree(
      [createLocation({ id: 'loc-1', name: 'Plant', parentId: '' })],
      [],
      [],
    );
    tree.buildTree();

    const [node, error] = tree.addNode(createLocation({
      id: 'loc-2',
      name: 'Line 1',
      parentId: 'loc-1',
    }));

    expect(error).toBeUndefined();
    expect(node?.parentId).toBe('loc-1');
    expect(tree.getPath('loc-2').map(pathNode => pathNode.id)).toEqual(['root', 'loc-1', 'loc-2']);
  });

  test('should add an asset under an existing location', () => {
    const tree = new AssetTree(
      [createLocation({ id: 'loc-1', name: 'Plant', parentId: '' })],
      [],
      [],
    );
    tree.buildTree();

    const [node, error] = tree.addNode(createAsset({
      id: 'asset-1',
      name: 'Pump',
      locationId: 'loc-1',
      parentId: '',
    }));

    expect(error).toBeUndefined();
    expect(node?.type).toBe(NODE_TYPE_ASSET);
    expect(tree.assets[0]?.locationId).toBe('loc-1');
    expect(tree.getPath('asset-1').map(pathNode => pathNode.id)).toEqual(['root', 'loc-1', 'asset-1']);
  });

  test('should add an asset under an existing asset parent', () => {
    const tree = new AssetTree(
      [createLocation({ id: 'loc-1', name: 'Plant', parentId: '' })],
      [createAsset({ id: 'asset-1', name: 'Pump', locationId: 'loc-1', parentId: '' })],
      [],
    );
    tree.buildTree();

    const [node, error] = tree.addNode(createAsset({
      id: 'asset-2',
      name: 'Motor',
      locationId: 'loc-1',
      parentId: 'asset-1',
    }));

    expect(error).toBeUndefined();
    expect(node?.parentId).toBe('asset-1');
    expect(tree.assets[1]?.parentId).toBe('asset-1');
    expect(tree.getPath('asset-2').map(pathNode => pathNode.id)).toEqual([
      'root',
      'loc-1',
      'asset-1',
      'asset-2',
    ]);
  });

  test('should add a component under an asset', () => {
    const tree = new AssetTree(
      [createLocation({ id: 'loc-1', name: 'Plant', parentId: '' })],
      [createAsset({ id: 'asset-1', name: 'Pump', locationId: 'loc-1', parentId: '' })],
      [],
    );
    tree.buildTree();

    const [node, error] = tree.addNode(createComponent({
      id: 'comp-1',
      name: 'Energy Sensor',
      parentId: 'asset-1',
      sensorType: SENSOR_ENERGY,
      status: STATUS_ALERT,
    }));

    expect(error).toBeUndefined();
    expect(node?.type).toBe(NODE_TYPE_COMPONENT);
    expect(tree.components[0]?.parentId).toBe('asset-1');
    expect(tree.getPath('comp-1').map(pathNode => pathNode.id)).toEqual([
      'root',
      'loc-1',
      'asset-1',
      'comp-1',
    ]);
  });

  test('should normalize invalid parents to root-level placement', () => {
    const tree = new AssetTree([], [], []);

    const [locationNode] = tree.addNode(createLocation({
      id: 'loc-1',
      name: 'Plant',
      parentId: 'missing-location',
    }));
    const [assetNode] = tree.addNode(createAsset({
      id: 'asset-1',
      name: 'Pump',
      locationId: 'missing-location',
      parentId: 'missing-asset',
    }));
    const [componentNode] = tree.addNode(createComponent({
      id: 'comp-1',
      name: 'Sensor',
      parentId: 'missing-parent',
      sensorType: SENSOR_ENERGY,
      status: STATUS_ALERT,
    }));

    expect(locationNode?.parentId).toBe('');
    expect(assetNode?.parentId).toBe('');
    expect(assetNode?.locationId).toBe('');
    expect(componentNode?.parentId).toBe('');
    expect(tree.root.children.map(child => child.id)).toEqual(['loc-1', 'asset-1', 'comp-1']);
  });

  test('should return an error for duplicate ids', () => {
    const tree = new AssetTree(
      [createLocation({ id: 'loc-1', name: 'Plant', parentId: '' })],
      [],
      [],
    );
    tree.buildTree();

    const [node, error] = tree.addNode(createLocation({
      id: 'loc-1',
      name: 'Duplicate Plant',
      parentId: '',
    }));

    expect(node).toBeUndefined();
    expect(error).toBeInstanceOf(Error);
    expect(tree.locations).toHaveLength(1);
  });

  test('should return an error for empty ids', () => {
    const tree = new AssetTree([], [], []);

    const [node, error] = tree.addNode(createLocation({
      id: '',
      name: 'Invalid',
      parentId: '',
    }));

    expect(node).toBeUndefined();
    expect(error).toBeInstanceOf(Error);
    expect(tree.locations).toHaveLength(0);
  });
});
