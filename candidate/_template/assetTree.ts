import {
  Asset,
  Component,
  FilterCriteria,
  Location,
  TreeNode,
  createTreeNode,
  NODE_TYPE_ROOT,
} from './types.js';

export class AssetTree {
  root: TreeNode;
  locations: Location[];
  assets: Asset[];
  components: Component[];

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
    // TODO: implement
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
    // TODO: implement
    return undefined;
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
