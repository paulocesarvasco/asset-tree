import {
  Asset,
  Component,
  FilterCriteria,
  Location,
  NODE_TYPE_ASSET,
  NODE_TYPE_COMPONENT,
  NODE_TYPE_LOCATION,
  TreeNode,
  createTreeNode,
  NODE_TYPE_ROOT,
} from './types.js';

export class AssetTree {
  root: TreeNode;
  locations: Location[];
  assets: Asset[];
  components: Component[];
  nodeIndex: Map<string, TreeNode>;

  /**
   * Manages a hierarchical tree of locations, assets, and components.
   *
   * Your task is to implement the methods below. Required methods must be
   * implemented. Optional methods earn bonus points but are not required.
   */
  constructor(
    locations: Location[] | null,
    assets: Asset[] | null,
    components: Component[] | null,
  ) {
    this.root = createTreeNode({
      id: 'root',
      name: 'Root',
      type: NODE_TYPE_ROOT,
      children: [],
    });
    this.locations = locations ?? [];
    this.assets = assets ?? [];
    this.components = components ?? [];
    this.nodeIndex = new Map([[this.root.id, this.root]]);
  }

  // ── Required methods ─────────────────────────────────────────────────

  /**
   * Build the hierarchical tree from the flat input lists.
   *
   * Requirements:
   *   - Locations can have sub-locations (parentId references another location)
   *   - Assets can be under locations (locationId) or under other assets (parentId)
   *   - Components must be under assets or locations (parentId)
   *   - If parentId/locationId is empty or references a non-existent node, place at root
   *   - Components should not have children
   *   - Must handle circular references without hanging
   *
   * Returns the root node.
   */
  buildTree(): TreeNode {
    this.root.children = [];
    this.nodeIndex = new Map([[this.root.id, this.root]]);

    const treeNodes = new Map<string, TreeNode>();
    const visiting = new Set<string>();
    const built = new Set<string>();

    for (const location of this.locations) {
      const node = createTreeNode({
        id: location.id,
        name: location.name,
        type: NODE_TYPE_LOCATION,
        children: [],
        parentId: location.parentId,
      });
      treeNodes.set(location.id, node);
      this.nodeIndex.set(location.id, node);
    }

    for (const asset of this.assets) {
      const node = createTreeNode({
        id: asset.id,
        name: asset.name,
        type: NODE_TYPE_ASSET,
        children: [],
        locationId: asset.locationId,
        parentId: asset.parentId,
      });
      treeNodes.set(asset.id, node);
      this.nodeIndex.set(asset.id, node);
    }

    for (const component of this.components) {
      const node = createTreeNode({
        id: component.id,
        name: component.name,
        type: NODE_TYPE_COMPONENT,
        children: [],
        sensorType: component.sensorType,
        status: component.status,
        parentId: component.parentId,
      });
      treeNodes.set(component.id, node);
      this.nodeIndex.set(component.id, node);
    }

    const attachToParent = (node: TreeNode, parent: TreeNode) => {
      if (!parent.children.some(child => child.id === node.id)) {
        parent.children.push(node);
      }
    };

    const resolveLocationParentId = (location: Location): string => {
      if (!location.parentId) {
        return this.root.id;
      }

      const parent = treeNodes.get(location.parentId);
      return parent?.type === NODE_TYPE_LOCATION ? parent.id : this.root.id;
    };

    const resolveAssetParentId = (asset: Asset): string => {
      if (asset.parentId) {
        const assetParent = treeNodes.get(asset.parentId);
        if (assetParent?.type === NODE_TYPE_ASSET) {
          return assetParent.id;
        }
      }

      if (asset.locationId) {
        const locationParent = treeNodes.get(asset.locationId);
        if (locationParent?.type === NODE_TYPE_LOCATION) {
          return locationParent.id;
        }
      }

      return this.root.id;
    };

    const resolveComponentParentId = (component: Component): string => {
      if (!component.parentId) {
        return this.root.id;
      }

      const parent = treeNodes.get(component.parentId);
      if (parent?.type === NODE_TYPE_ASSET || parent?.type === NODE_TYPE_LOCATION) {
        return parent.id;
      }

      return this.root.id;
    };

    const resolveParentId = (nodeId: string): string => {
      const location = this.locations.find(item => item.id === nodeId);
      if (location) {
        return resolveLocationParentId(location);
      }

      const asset = this.assets.find(item => item.id === nodeId);
      if (asset) {
        return resolveAssetParentId(asset);
      }

      const component = this.components.find(item => item.id === nodeId);
      if (component) {
        return resolveComponentParentId(component);
      }

      return this.root.id;
    };

    const buildNode = (nodeId: string) => {
      if (built.has(nodeId)) {
        return;
      }

      const node = treeNodes.get(nodeId);
      if (!node) {
        return;
      }

      if (visiting.has(nodeId)) {
        attachToParent(node, this.root);
        built.add(nodeId);
        return;
      }

      visiting.add(nodeId);

      const parentId = resolveParentId(nodeId);
      const parent = parentId === this.root.id ? this.root : treeNodes.get(parentId);

      if (parent && parent.type !== NODE_TYPE_COMPONENT) {
        if (parent !== this.root) {
          buildNode(parent.id);
        }
        attachToParent(node, parent);
      } else {
        attachToParent(node, this.root);
      }

      visiting.delete(nodeId);
      built.add(nodeId);
    };

    for (const nodeId of treeNodes.keys()) {
      buildNode(nodeId);
    }

    return this.root;
  }

  /**
   * Find a node anywhere in the tree by its ID.
   *
   * Requirements:
   *   - Return the node if found, undefined if not found
   *   - Empty string returns undefined
   *   - Should be efficient — avoid O(n) linear scans when possible
   */
  findNodeById(nodeId: string): TreeNode | undefined {
    if (!nodeId) {
      return undefined;
    }

    if (!this.nodeIndex.has(nodeId)) {
      this.buildTree();
    }

    return this.nodeIndex.get(nodeId);
  }

  /**
   * Return the path from root to the node with the given ID (inclusive).
   *
   * Requirements:
   *   - Return [root, ..., targetNode] for a found node
   *   - Return empty array if node is not found
   *   - First element must be root, last element must be the target
   */
  getPath(nodeId: string): TreeNode[] {
    // TODO: implement
    return [];
  }

  // ── Optional methods ─────────────────────────────────────────────────

  /**
   * Return a new tree containing only nodes that match the criteria
   * and their ancestors (to preserve path context).
   *
   * Requirements:
   *   - Do not mutate the original tree
   *   - Preserve all ancestors of matching nodes
   *   - Text search is case-insensitive (matches node name)
   *   - SensorTypes and Statuses filter components (AND logic across fields)
   */
  filterTree(criteria: FilterCriteria): TreeNode | undefined {
    throw new Error('Not implemented');
  }

  /**
   * Add a new location, asset, or component to the tree.
   *
   * Requirements:
   *   - Determine node type and parent from the fields of node
   *   - Update the backing list (locations / assets / components)
   *   - Maintain tree structure consistency
   *   - Return the created TreeNode, or an error if the operation is invalid
   */
  addNode(node: Location | Asset | Component): [TreeNode | undefined, Error | undefined] {
    throw new Error('Not implemented');
  }

  /**
   * Remove the node with the given ID and all its descendants.
   *
   * Requirements:
   *   - Remove from tree and from the backing list
   *   - Cannot remove root — return false if id === "root"
   *   - Return false if node not found
   */
  removeNode(nodeId: string): boolean {
    throw new Error('Not implemented');
  }

  /**
   * Move the node with the given ID to a new parent.
   *
   * Requirements:
   *   - Detach from current parent, attach to newParentId
   *   - Update backing lists to reflect new hierarchy
   *   - Prevent cycles (cannot move a node under its own descendant)
   *   - newParentId === "root" or "" moves the node to root level
   *   - Return false if the operation is invalid (cycle, not found, etc.)
   */
  moveNode(nodeId: string, newParentId: string): boolean {
    throw new Error('Not implemented');
  }
}
