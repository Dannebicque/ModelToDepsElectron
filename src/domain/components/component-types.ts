/**
 * Types de base pour le système de composants
 */

// Énumérations pour les propriétés communes
export enum ShapeType {
  RECTANGLE = 'rectangle',
  ELLIPSE = 'ellipse',
  DIAMOND = 'diamond',
  CIRCLE = 'circle',
  ROUNDED_RECTANGLE = 'rounded-rectangle',
}

export enum BorderStyle {
  NONE = 'none',
  SINGLE = 'single',
  DOUBLE = 'double',
  DASHED = 'dashed',
  DOTTED = 'dotted',
}

export enum ComponentType {
  PROCESS = 'process',
  DECISION = 'decision',
  START_END = 'start-end',
  DATA = 'data',
  CUSTOM = 'custom',
  CONNECTOR = 'connector',
}

// Propriétés de style
export interface StyleProperties {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  borderStyle: BorderStyle;
  opacity?: number;
  shadow?: boolean;
}

// Propriétés de position et taille
export interface PositionProperties {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number; // en degrés
}

// Propriétés de contenu
export interface ContentProperties {
  text?: string;
  equation?: string; // Format LaTeX pour les équations
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
}

// Interface de base pour tous les composants
export interface BaseComponentData {
  id: string;
  type: ComponentType;
  shape: ShapeType;
  position: PositionProperties;
  style: StyleProperties;
  content: ContentProperties;
  stepIds: string[]; // Étapes où le composant apparaît
  metadata?: Record<string, any>; // Pour des propriétés personnalisées
  createdAt: Date;
  updatedAt: Date;
}

// Types discriminés pour chaque type de composant
export interface ProcessComponentData extends BaseComponentData {
  type: ComponentType.PROCESS;
  shape: ShapeType.RECTANGLE;
  processName?: string;
  description?: string;
}

export interface DecisionComponentData extends BaseComponentData {
  type: ComponentType.DECISION;
  shape: ShapeType.DIAMOND;
  question?: string;
  conditions?: string[];
}

export interface StartEndComponentData extends BaseComponentData {
  type: ComponentType.START_END;
  shape: ShapeType.ELLIPSE | ShapeType.CIRCLE | ShapeType.ROUNDED_RECTANGLE;
  isStart: boolean;
}

export interface DataComponentData extends BaseComponentData {
  type: ComponentType.DATA;
  dataType?: string;
  fields?: Array<{ name: string; type: string }>;
}

export interface CustomComponentData extends BaseComponentData {
  type: ComponentType.CUSTOM;
  customProperties?: Record<string, any>;
}

// Import du type ConnectorComponentData
export type { ConnectorComponentData } from './connector-component';

// Union type de tous les types de composants
export type ComponentData =
  | ProcessComponentData
  | DecisionComponentData
  | StartEndComponentData
  | DataComponentData
  | CustomComponentData
  | import('./connector-component').ConnectorComponentData;

// Type pour la sérialisation JSON
export type SerializedComponent = Omit<ComponentData, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};
