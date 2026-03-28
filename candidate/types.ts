// --- Enums (string constants) ------------------------------------------------

export const SENSOR_VIBRATION = "vibration";
export const SENSOR_ENERGY = "energy";

export const STATUS_OPERATING = "operating";
export const STATUS_ALERT = "alert";

export const NODE_TYPE_ROOT = "root";
export const NODE_TYPE_LOCATION = "location";
export const NODE_TYPE_ASSET = "asset";
export const NODE_TYPE_COMPONENT = "component";

// --- Input types -------------------------------------------------------------

export interface Location {
  id: string;
  name: string;
  parentId: string;
}

export interface Asset {
  id: string;
  name: string;
  locationId: string;
  parentId: string;
}

export interface Component {
  id: string;
  name: string;
  parentId: string;
  sensorType: string;
  status: string;
}

// --- Output type -------------------------------------------------------------

export interface TreeNode {
  id: string;
  name: string;
  type: string;
  children: TreeNode[];
  sensorType: string;
  status: string;
  locationId: string;
  parentId: string;
}

// --- Query type --------------------------------------------------------------

export interface FilterCriteria {
  text: string;
  sensorTypes: string[];
  statuses: string[];
}

// --- Factory functions -------------------------------------------------------

export function createLocation(props: Partial<Location> = {}): Location {
  return {
    id: props.id ?? "",
    name: props.name ?? "",
    parentId: props.parentId ?? "",
  };
}

export function createAsset(props: Partial<Asset> = {}): Asset {
  return {
    id: props.id ?? "",
    name: props.name ?? "",
    locationId: props.locationId ?? "",
    parentId: props.parentId ?? "",
  };
}

export function createComponent(props: Partial<Component> = {}): Component {
  return {
    id: props.id ?? "",
    name: props.name ?? "",
    parentId: props.parentId ?? "",
    sensorType: props.sensorType ?? "",
    status: props.status ?? "",
  };
}

export function createTreeNode(props: Partial<TreeNode> = {}): TreeNode {
  return {
    id: props.id ?? "",
    name: props.name ?? "",
    type: props.type ?? "",
    children: props.children ?? [],
    sensorType: props.sensorType ?? "",
    status: props.status ?? "",
    locationId: props.locationId ?? "",
    parentId: props.parentId ?? "",
  };
}

export function createFilterCriteria(props: Partial<FilterCriteria> = {}): FilterCriteria {
  return {
    text: props.text ?? "",
    sensorTypes: props.sensorTypes ?? [],
    statuses: props.statuses ?? [],
  };
}
