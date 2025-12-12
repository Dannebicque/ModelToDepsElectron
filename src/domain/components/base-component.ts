/**
 * Classe abstraite de base pour tous les composants
 */

import {
  ComponentData,
  ComponentType,
  ShapeType,
  PositionProperties,
  StyleProperties,
  ContentProperties,
  BorderStyle,
  SerializedComponent,
} from './component-types';

export abstract class BaseComponent<T extends ComponentData = ComponentData> {
  protected data: T;

  constructor(data: Partial<T>) {
    this.data = this.initializeData(data);
  }

  /**
   * Initialise les données du composant avec des valeurs par défaut
   */
  protected initializeData(partial: Partial<T>): T {
    const now = new Date();
    
    return {
      id: partial.id ?? crypto.randomUUID(),
      type: partial.type ?? this.getDefaultType(),
      shape: partial.shape ?? this.getDefaultShape(),
      position: partial.position ?? this.getDefaultPosition(),
      style: partial.style ?? this.getDefaultStyle(),
      content: partial.content ?? this.getDefaultContent(),
      stepIds: partial.stepIds ?? [],
      metadata: partial.metadata ?? {},
      createdAt: partial.createdAt ?? now,
      updatedAt: partial.updatedAt ?? now,
      ...this.getSpecificDefaults(partial),
    } as T;
  }

  /**
   * Méthodes abstraites à implémenter par les classes dérivées
   */
  protected abstract getDefaultType(): ComponentType;
  protected abstract getDefaultShape(): ShapeType;
  protected abstract getSpecificDefaults(partial: Partial<T>): Partial<T>;

  /**
   * Valeurs par défaut pour la position
   */
  protected getDefaultPosition(): PositionProperties {
    return {
      x: 100,
      y: 100,
      width: 160,
      height: 80,
      rotation: 0,
    };
  }

  /**
   * Valeurs par défaut pour le style
   */
  protected getDefaultStyle(): StyleProperties {
    return {
      fillColor: '#4a90e2',
      strokeColor: '#2c5aa0',
      strokeWidth: 2,
      borderStyle: BorderStyle.SINGLE,
      opacity: 1,
      shadow: false,
    };
  }

  /**
   * Valeurs par défaut pour le contenu
   */
  protected getDefaultContent(): ContentProperties {
    return {
      text: '',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      textColor: '#000000',
      textAlign: 'center',
    };
  }

  // ========== Getters ==========
  get id(): string {
    return this.data.id;
  }

  get type(): ComponentType {
    return this.data.type;
  }

  get shape(): ShapeType {
    return this.data.shape;
  }

  get position(): PositionProperties {
    return { ...this.data.position };
  }

  get style(): StyleProperties {
    return { ...this.data.style };
  }

  get content(): ContentProperties {
    return { ...this.data.content };
  }

  get stepIds(): string[] {
    return [...this.data.stepIds];
  }

  get metadata(): Record<string, any> {
    return { ...this.data.metadata };
  }

  getData(): T {
    return { ...this.data };
  }

  // ========== Setters ==========
  updatePosition(position: Partial<PositionProperties>): this {
    this.data.position = { ...this.data.position, ...position };
    this.touch();
    return this;
  }

  updateStyle(style: Partial<StyleProperties>): this {
    this.data.style = { ...this.data.style, ...style };
    this.touch();
    return this;
  }

  updateContent(content: Partial<ContentProperties>): this {
    this.data.content = { ...this.data.content, ...content };
    this.touch();
    return this;
  }

  addToStep(stepId: string): this {
    if (!this.data.stepIds.includes(stepId)) {
      this.data.stepIds.push(stepId);
      this.touch();
    }
    return this;
  }

  removeFromStep(stepId: string): this {
    this.data.stepIds = this.data.stepIds.filter(id => id !== stepId);
    this.touch();
    return this;
  }

  setMetadata(key: string, value: any): this {
    this.data.metadata![key] = value;
    this.touch();
    return this;
  }

  protected touch(): void {
    this.data.updatedAt = new Date();
  }

  // ========== Méthodes de validation ==========
  abstract validate(): boolean;

  protected validateBase(): boolean {
    return (
      !!this.data.id &&
      !!this.data.type &&
      !!this.data.shape &&
      this.data.position.width > 0 &&
      this.data.position.height > 0
    );
  }

  // ========== Sérialisation ==========
  toJSON(): SerializedComponent {
    return {
      ...this.data,
      createdAt: this.data.createdAt.toISOString(),
      updatedAt: this.data.updatedAt.toISOString(),
    };
  }

  static fromJSON<T extends BaseComponent>(
    this: new (data: any) => T,
    json: SerializedComponent
  ): T {
    return new this({
      ...json,
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
    });
  }

  // ========== Clonage ==========
  clone(): BaseComponent<T> {
    const clonedData = {
      ...this.data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return new (this.constructor as any)(clonedData);
  }
}
