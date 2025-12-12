/**
 * Composant de type Processus
 * Représente une action ou un traitement
 */

import { BaseComponent } from './base-component';
import {
  ProcessComponentData,
  ComponentType,
  ShapeType,
} from './component-types';

export class ProcessComponent extends BaseComponent<ProcessComponentData> {
  protected getDefaultType(): ComponentType {
    return ComponentType.PROCESS;
  }

  protected getDefaultShape(): ShapeType {
    return ShapeType.RECTANGLE;
  }

  protected getSpecificDefaults(partial: Partial<ProcessComponentData>): Partial<ProcessComponentData> {
    return {
      processName: partial.processName ?? 'Nouveau processus',
      description: partial.description ?? '',
    };
  }

  validate(): boolean {
    return this.validateBase() && !!this.data.processName;
  }

  // Méthodes spécifiques au ProcessComponent
  setProcessName(name: string): this {
    this.data.processName = name;
    this.touch();
    return this;
  }

  setDescription(description: string): this {
    this.data.description = description;
    this.touch();
    return this;
  }

  get processName(): string | undefined {
    return this.data.processName;
  }

  get description(): string | undefined {
    return this.data.description;
  }
}
