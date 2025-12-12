/**
 * Composant de type Début/Fin
 * Représente le début ou la fin d'un processus
 */

import { BaseComponent } from './base-component';
import {
  StartEndComponentData,
  ComponentType,
  ShapeType,
  StyleProperties,
  BorderStyle,
} from './component-types';

export class StartEndComponent extends BaseComponent<StartEndComponentData> {
  protected getDefaultType(): ComponentType {
    return ComponentType.START_END;
  }

  protected getDefaultShape(): ShapeType {
    return ShapeType.ROUNDED_RECTANGLE;
  }

  protected getDefaultStyle(): StyleProperties {
    return {
      ...super.getDefaultStyle(),
      fillColor: '#27ae60',
      strokeColor: '#1e8449',
      borderStyle: BorderStyle.DOUBLE,
    };
  }

  protected getSpecificDefaults(partial: Partial<StartEndComponentData>): Partial<StartEndComponentData> {
    return {
      isStart: partial.isStart ?? true,
    };
  }

  validate(): boolean {
    return this.validateBase();
  }

  setIsStart(isStart: boolean): this {
    this.data.isStart = isStart;
    // Adapter le contenu par défaut
    if (!this.data.content.text) {
      this.data.content.text = isStart ? 'Début' : 'Fin';
    }
    // Adapter la couleur
    this.data.style.fillColor = isStart ? '#27ae60' : '#e74c3c';
    this.data.style.strokeColor = isStart ? '#1e8449' : '#c0392b';
    this.touch();
    return this;
  }

  get isStart(): boolean {
    return this.data.isStart;
  }
}
