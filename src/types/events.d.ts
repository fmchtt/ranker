export type ObjectMovedEvent = {
  objectIndex: number;
  origin: string;
  target: string;
};

export type ObjectRemovedEvent = {
  objectIndex: number;
  originColumn: string;
};

export type ColumnHoveredEvent = {
  id: string;
};

export type ColumnRemovedEvent = {
  originColumn: string;
};
