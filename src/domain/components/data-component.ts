/**
 * Composant de type Données
 * Représente des données ou une base de données
 */

import { BaseComponent } from './base-component';
import {
  DataComponentData,
  ComponentType,
  ShapeType,
  StyleProperties,
} from './component-types';

export class DataComponent extends BaseComponent<DataComponentData> {
  protected getDefaultType(): ComponentType {
    return ComponentType.DATA;
  }

  protected getDefaultShape(): ShapeType {
    return ShapeType.RECTANGLE;
  }

  protected getDefaultStyle(): StyleProperties {
    return {
      ...super.getDefaultStyle(),
      fillColor: '#9b59b6',
      strokeColor: '#7d3c98',
    };
  }

  protected getSpecificDefaults(partial: Partial<DataComponentData>): Partial<DataComponentData> {
    return {
      dataType: partial.dataType ?? 'generic',
      fields: partial.fields ?? [],
    };
  }

  validate(): boolean {
    return this.validateBase();
  }

  setDataType(dataType: string): this {
    this.data.dataType = dataType;
    this.touch();
    return this;
  }

  addField(name: string, type: string): this {
    if (!this.data.fields) {
      this.data.fields = [];
    }
    this.data.fields.push({ name, type });
    this.touch();
    return this;
  }

  removeField(name: string): this {
    if (this.data.fields) {
      this.data.fields = this.data.fields.filter(f => f.name !== name);
      this.touch();
    }
    return this;
  }

  get dataType(): string | undefined {
    return this.data.dataType;
  }

  get fields(): Array<{ name: string; type: string }> {
    return this.data.fields ? [...this.data.fields] : [];
  }
}
