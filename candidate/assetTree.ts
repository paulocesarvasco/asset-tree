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
  parentIndex: Map<string, string>;

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
    this.parentIndex = new Map([[this.root.id, '']]);
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
    this.parentIndex = new Map([[this.root.id, '']]);

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
        node.parentId = parent.id === this.root.id ? '' : parent.id;
        this.parentIndex.set(node.id, parent.id);
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
          if (built.has(nodeId)) {
            visiting.delete(nodeId);
            return;
          }
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
    if (!nodeId) {
      return [];
    }

    if (!this.nodeIndex.has(nodeId) || this.nodeIndex.size === 1 && (
      this.locations.length > 0 ||
      this.assets.length > 0 ||
      this.components.length > 0
    )) {
      this.buildTree();
    }

    if (!this.nodeIndex.has(nodeId)) {
      return [];
    }

    const path: TreeNode[] = [];
    const seen = new Set<string>();
    let currentId: string | undefined = nodeId;

    while (currentId && !seen.has(currentId)) {
      const node = this.nodeIndex.get(currentId);
      if (!node) {
        return [];
      }

      path.push(node);
      seen.add(currentId);

      if (currentId === this.root.id) {
        break;
      }

      currentId = this.parentIndex.get(currentId);
    }

    if (path[path.length - 1]?.id !== this.root.id) {
      return [];
    }

    return path.reverse();
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
    if (!this.nodeIndex.has(this.root.id) || this.nodeIndex.size === 1 && (
      this.locations.length > 0 ||
      this.assets.length > 0 ||
      this.components.length > 0
    )) {
      this.buildTree();
    }

    const normalizedText = criteria.text.trim().toLowerCase();
    const sensorTypes = new Set(criteria.sensorTypes);
    const statuses = new Set(criteria.statuses);

    const matchesText = (node: TreeNode): boolean => {
      if (!normalizedText) {
        return true;
      }

      return node.name.toLowerCase().includes(normalizedText);
    };

    const matchesNode = (node: TreeNode): boolean => {
      if (!matchesText(node)) {
        return false;
      }

      if (node.type !== NODE_TYPE_COMPONENT) {
        return true;
      }

      const matchesSensorType = sensorTypes.size === 0 || sensorTypes.has(node.sensorType);
      const matchesStatus = statuses.size === 0 || statuses.has(node.status);

      return matchesSensorType && matchesStatus;
    };

    const cloneFilteredNode = (node: TreeNode): TreeNode | undefined => {
      const filteredChildren = node.children
        .map(child => cloneFilteredNode(child))
        .filter((child): child is TreeNode => child !== undefined);

      if (!matchesNode(node) && filteredChildren.length === 0) {
        return undefined;
      }

      return createTreeNode({
        id: node.id,
        name: node.name,
        type: node.type,
        children: filteredChildren,
        sensorType: node.sensorType,
        status: node.status,
        locationId: node.locationId,
        parentId: node.parentId,
      });
    };

    return cloneFilteredNode(this.root);
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
    if (!this.nodeIndex.has(this.root.id) || this.nodeIndex.size === 1 && (
      this.locations.length > 0 ||
      this.assets.length > 0 ||
      this.components.length > 0
    )) {
      this.buildTree();
    }

    if (!node.id || node.id === this.root.id) {
      return [undefined, new Error('Node id must be non-empty and cannot be root')];
    }

    if (this.nodeIndex.has(node.id)) {
      return [undefined, new Error(`Node with id "${node.id}" already exists`)];
    }

    const resolveLocationParentId = (parentId: string): string => {
      if (!parentId) {
        return '';
      }

      const parent = this.nodeIndex.get(parentId);
      return parent?.type === NODE_TYPE_LOCATION ? parent.id : '';
    };

    const resolveAssetFields = (asset: Asset): Asset => {
      const assetParent = asset.parentId ? this.nodeIndex.get(asset.parentId) : undefined;
      if (assetParent?.type === NODE_TYPE_ASSET) {
        return {
          ...asset,
          parentId: assetParent.id,
          locationId: asset.locationId,
        };
      }

      const locationParent = asset.locationId ? this.nodeIndex.get(asset.locationId) : undefined;
      if (locationParent?.type === NODE_TYPE_LOCATION) {
        return {
          ...asset,
          parentId: '',
          locationId: locationParent.id,
        };
      }

      return {
        ...asset,
        parentId: '',
        locationId: '',
      };
    };

    const resolveComponentParentId = (parentId: string): string => {
      if (!parentId) {
        return '';
      }

      const parent = this.nodeIndex.get(parentId);
      if (parent?.type === NODE_TYPE_LOCATION || parent?.type === NODE_TYPE_ASSET) {
        return parent.id;
      }

      return '';
    };

    const isComponentNode = (candidate: Location | Asset | Component): candidate is Component =>
      'sensorType' in candidate || 'status' in candidate;

    const isAssetNode = (candidate: Location | Asset | Component): candidate is Asset =>
      'locationId' in candidate;

    if (isComponentNode(node)) {
      this.components.push({
        ...node,
        parentId: resolveComponentParentId(node.parentId),
      });
    } else if (isAssetNode(node)) {
      this.assets.push(resolveAssetFields(node));
    } else {
      this.locations.push({
        ...node,
        parentId: resolveLocationParentId(node.parentId),
      });
    }

    this.buildTree();
    return [this.nodeIndex.get(node.id), undefined];
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
    if (!nodeId || nodeId === this.root.id) {
      return false;
    }

    if (!this.nodeIndex.has(nodeId) || this.nodeIndex.size === 1 && (
      this.locations.length > 0 ||
      this.assets.length > 0 ||
      this.components.length > 0
    )) {
      this.buildTree();
    }

    const node = this.nodeIndex.get(nodeId);
    if (!node) {
      return false;
    }

    const idsToRemove = new Set<string>();
    const stack: TreeNode[] = [node];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || idsToRemove.has(current.id)) {
        continue;
      }

      idsToRemove.add(current.id);
      for (const child of current.children) {
        stack.push(child);
      }
    }

    this.locations = this.locations.filter(location => !idsToRemove.has(location.id));
    this.assets = this.assets.filter(asset => !idsToRemove.has(asset.id));
    this.components = this.components.filter(component => !idsToRemove.has(component.id));

    this.buildTree();
    return true;
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
    if (!nodeId || nodeId === this.root.id) {
      return false;
    }

    if (!this.nodeIndex.has(nodeId) || this.nodeIndex.size === 1 && (
      this.locations.length > 0 ||
      this.assets.length > 0 ||
      this.components.length > 0
    )) {
      this.buildTree();
    }

    const node = this.nodeIndex.get(nodeId);
    if (!node) {
      return false;
    }

    const targetParentId = !newParentId || newParentId === this.root.id ? this.root.id : newParentId;
    const parent = this.nodeIndex.get(targetParentId);
    if (!parent) {
      return false;
    }

    if (targetParentId !== this.root.id) {
      const subtreeIds = new Set<string>();
      const stack: TreeNode[] = [node];

      while (stack.length > 0) {
        const current = stack.pop();
        if (!current || subtreeIds.has(current.id)) {
          continue;
        }

        subtreeIds.add(current.id);
        for (const child of current.children) {
          stack.push(child);
        }
      }

      if (subtreeIds.has(targetParentId)) {
        return false;
      }
    }

    const getNearestLocationId = (startId: string): string => {
      let currentId: string | undefined = startId;
      const seen = new Set<string>();

      while (currentId && currentId !== this.root.id && !seen.has(currentId)) {
        seen.add(currentId);

        const currentNode = this.nodeIndex.get(currentId);
        if (!currentNode) {
          return '';
        }

        if (currentNode.type === NODE_TYPE_LOCATION) {
          return currentNode.id;
        }

        currentId = this.parentIndex.get(currentId);
      }

      return '';
    };

    if (node.type === NODE_TYPE_LOCATION) {
      if (targetParentId === this.root.id) {
        this.locations = this.locations.map(location =>
          location.id === nodeId ? { ...location, parentId: '' } : location);
      } else if (parent.type === NODE_TYPE_LOCATION) {
        this.locations = this.locations.map(location =>
          location.id === nodeId ? { ...location, parentId: parent.id } : location);
      } else {
        return false;
      }
    } else if (node.type === NODE_TYPE_ASSET) {
      if (targetParentId === this.root.id) {
        this.assets = this.assets.map(asset =>
          asset.id === nodeId ? { ...asset, parentId: '', locationId: '' } : asset);
      } else if (parent.type === NODE_TYPE_LOCATION) {
        this.assets = this.assets.map(asset =>
          asset.id === nodeId ? { ...asset, parentId: '', locationId: parent.id } : asset);
      } else if (parent.type === NODE_TYPE_ASSET) {
        this.assets = this.assets.map(asset =>
          asset.id === nodeId ? {
            ...asset,
            parentId: parent.id,
            locationId: getNearestLocationId(parent.id),
          } : asset);
      } else {
        return false;
      }
    } else if (node.type === NODE_TYPE_COMPONENT) {
      if (targetParentId === this.root.id) {
        this.components = this.components.map(component =>
          component.id === nodeId ? { ...component, parentId: '' } : component);
      } else if (parent.type === NODE_TYPE_LOCATION || parent.type === NODE_TYPE_ASSET) {
        this.components = this.components.map(component =>
          component.id === nodeId ? { ...component, parentId: parent.id } : component);
      } else {
        return false;
      }
    } else {
      return false;
    }

    this.buildTree();
    return true;
  }
}
