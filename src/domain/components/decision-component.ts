/**
 * Composant de type Décision
 * Représente un point de décision avec des conditions
 */

import { BaseComponent } from './base-component';
import {
  DecisionComponentData,
  ComponentType,
  ShapeType,
  StyleProperties,
} from './component-types';

export class DecisionComponent extends BaseComponent<DecisionComponentData> {
  protected getDefaultType(): ComponentType {
    return ComponentType.DECISION;
  }

  protected getDefaultShape(): ShapeType {
    return ShapeType.DIAMOND;
  }

  protected getDefaultStyle(): StyleProperties {
    return {
      ...super.getDefaultStyle(),
      fillColor: '#f39c12',
      strokeColor: '#d68910',
    };
  }

  protected getSpecificDefaults(partial: Partial<DecisionComponentData>): Partial<DecisionComponentData> {
    return {
      question: partial.question ?? 'Condition?',
      conditions: partial.conditions ?? ['Oui', 'Non'],
    };
  }

  validate(): boolean {
    return (
      this.validateBase() &&
      !!this.data.question &&
      Array.isArray(this.data.conditions) &&
      this.data.conditions.length > 0
    );
  }

  // Méthodes spécifiques
  setQuestion(question: string): this {
    this.data.question = question;
    this.touch();
    return this;
  }

  addCondition(condition: string): this {
    if (!this.data.conditions) {
      this.data.conditions = [];
    }
    this.data.conditions.push(condition);
    this.touch();
    return this;
  }

  removeCondition(condition: string): this {
    if (this.data.conditions) {
      this.data.conditions = this.data.conditions.filter(c => c !== condition);
      this.touch();
    }
    return this;
  }

  get question(): string | undefined {
    return this.data.question;
  }

  get conditions(): string[] {
    return this.data.conditions ? [...this.data.conditions] : [];
  }
}
