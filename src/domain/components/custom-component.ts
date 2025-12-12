/**
 * Composant personnalisé
 * Pour des cas d'usage spécifiques non couverts par les autres types
 */

import { BaseComponent } from './base-component';
import {
  CustomComponentData,
  ComponentType,
  ShapeType,
} from './component-types';

export class CustomComponent extends BaseComponent<CustomComponentData> {
  protected getDefaultType(): ComponentType {
    return ComponentType.CUSTOM;
  }

  protected getDefaultShape(): ShapeType {
    return ShapeType.RECTANGLE;
  }

  protected getSpecificDefaults(partial: Partial<CustomComponentData>): Partial<CustomComponentData> {
    return {
      customProperties: partial.customProperties ?? {},
    };
  }

  validate(): boolean {
    return this.validateBase();
  }

  setCustomProperty(key: string, value: any): this {
    if (!this.data.customProperties) {
      this.data.customProperties = {};
    }
    this.data.customProperties[key] = value;
    this.touch();
    return this;
  }

  getCustomProperty(key: string): any {
    return this.data.customProperties?.[key];
  }

  get customProperties(): Record<string, any> {
    return this.data.customProperties ? { ...this.data.customProperties } : {};
  }
}
