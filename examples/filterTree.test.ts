import { describe, expect, test } from 'vitest';
import { AssetTree } from '../candidate/assetTree.js';
import {
  createAsset,
  createComponent,
  createFilterCriteria,
  createLocation,
  SENSOR_ENERGY,
  SENSOR_VIBRATION,
  STATUS_ALERT,
  STATUS_OPERATING,
} from '../candidate/types.js';

describe('FilterTreeBehavior', () => {
  test('should return a cloned full tree when criteria are empty', () => {
    const tree = new AssetTree(
      [createLocation({ id: 'loc-1', name: 'Plant', parentId: '' })],
      [createAsset({ id: 'asset-1', name: 'Pump', locationId: 'loc-1', parentId: '' })],
      [
        createComponent({
          id: 'comp-1',
          name: 'Sensor',
          parentId: 'asset-1',
          sensorType: SENSOR_VIBRATION,
          status: STATUS_OPERATING,
        }),
      ],
    );

    tree.buildTree();
    const filtered = tree.filterTree(createFilterCriteria());

    expect(filtered).toBeDefined();
    expect(filtered).not.toBe(tree.root);
    expect(filtered?.children[0]).not.toBe(tree.root.children[0]);
    expect(filtered?.children.map(node => node.id)).toEqual(['loc-1']);
  });

  test('should filter by text case-insensitively and preserve ancestors', () => {
    const tree = new AssetTree(
      [createLocation({ id: 'loc-1', name: 'Plant', parentId: '' })],
      [createAsset({ id: 'asset-1', name: 'Primary Pump', locationId: 'loc-1', parentId: '' })],
      [
        createComponent({
          id: 'comp-1',
          name: 'Temperature Sensor',
          parentId: 'asset-1',
          sensorType: SENSOR_VIBRATION,
          status: STATUS_OPERATING,
        }),
      ],
    );

    tree.buildTree();
    const filtered = tree.filterTree(createFilterCriteria({ text: 'sensor' }));

    expect(filtered?.id).toBe('root');
    expect(filtered?.children.map(node => node.id)).toEqual(['loc-1']);
    expect(filtered?.children[0]?.children.map(node => node.id)).toEqual(['asset-1']);
    expect(filtered?.children[0]?.children[0]?.children.map(node => node.id)).toEqual(['comp-1']);
  });

  test('should filter components by sensor type and status with AND logic', () => {
    const tree = new AssetTree(
      [createLocation({ id: 'loc-1', name: 'Plant', parentId: '' })],
      [createAsset({ id: 'asset-1', name: 'Pump', locationId: 'loc-1', parentId: '' })],
      [
        createComponent({
          id: 'comp-1',
          name: 'Vibration Sensor',
          parentId: 'asset-1',
          sensorType: SENSOR_VIBRATION,
          status: STATUS_OPERATING,
        }),
        createComponent({
          id: 'comp-2',
          name: 'Energy Sensor',
          parentId: 'asset-1',
          sensorType: SENSOR_ENERGY,
          status: STATUS_ALERT,
        }),
      ],
    );

    tree.buildTree();
    const filtered = tree.filterTree(createFilterCriteria({
      sensorTypes: [SENSOR_ENERGY],
      statuses: [STATUS_ALERT],
    }));

    expect(filtered?.children[0]?.children[0]?.children.map(node => node.id)).toEqual(['comp-2']);
  });

  test('should return components matching any requested sensor type', () => {
    const tree = new AssetTree(
      [createLocation({ id: 'loc-1', name: 'Plant', parentId: '' })],
      [createAsset({ id: 'asset-1', name: 'Pump', locationId: 'loc-1', parentId: '' })],
      [
        createComponent({
          id: 'comp-1',
          name: 'Vibration Sensor',
          parentId: 'asset-1',
          sensorType: SENSOR_VIBRATION,
          status: STATUS_OPERATING,
        }),
        createComponent({
          id: 'comp-2',
          name: 'Energy Sensor',
          parentId: 'asset-1',
          sensorType: SENSOR_ENERGY,
          status: STATUS_ALERT,
        }),
      ],
    );

    tree.buildTree();
    const filtered = tree.filterTree(createFilterCriteria({
      sensorTypes: [SENSOR_VIBRATION, SENSOR_ENERGY],
    }));

    expect(filtered?.children[0]?.children[0]?.children.map(node => node.id)).toEqual([
      'comp-1',
      'comp-2',
    ]);
  });

  test('should return undefined when nothing matches', () => {
    const tree = new AssetTree(
      [createLocation({ id: 'loc-1', name: 'Plant', parentId: '' })],
      [],
      [],
    );

    tree.buildTree();

    expect(tree.filterTree(createFilterCriteria({ text: 'missing' }))).toBeUndefined();
  });

  test('should not mutate the original tree', () => {
    const tree = new AssetTree(
      [createLocation({ id: 'loc-1', name: 'Plant', parentId: '' })],
      [createAsset({ id: 'asset-1', name: 'Pump', locationId: 'loc-1', parentId: '' })],
      [
        createComponent({
          id: 'comp-1',
          name: 'Vibration Sensor',
          parentId: 'asset-1',
          sensorType: SENSOR_VIBRATION,
          status: STATUS_OPERATING,
        }),
        createComponent({
          id: 'comp-2',
          name: 'Energy Sensor',
          parentId: 'asset-1',
          sensorType: SENSOR_ENERGY,
          status: STATUS_ALERT,
        }),
      ],
    );

    tree.buildTree();
    const originalChildren = tree.root.children[0]?.children[0]?.children.map(node => node.id);

    tree.filterTree(createFilterCriteria({ sensorTypes: [SENSOR_ENERGY] }));

    expect(tree.root.children[0]?.children[0]?.children.map(node => node.id)).toEqual(originalChildren);
  });
});
