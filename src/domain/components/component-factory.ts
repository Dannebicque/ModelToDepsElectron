/**
 * Factory pour créer des composants
 * Garantit la création de composants valides selon leur type
 */

import { BaseComponent } from './base-component';
import { ProcessComponent } from './process-component';
import { DecisionComponent } from './decision-component';
import { StartEndComponent } from './start-end-component';
import { DataComponent } from './data-component';
import { CustomComponent } from './custom-component';
import {
  ComponentType,
  ComponentData,
  ProcessComponentData,
  DecisionComponentData,
  StartEndComponentData,
  DataComponentData,
  CustomComponentData,
  SerializedComponent,
} from './component-types';

export class ComponentFactory {
  /**
   * Crée un composant en fonction de son type
   */
  static create(type: ComponentType, data?: Partial<ComponentData>): BaseComponent {
    switch (type) {
      case ComponentType.PROCESS:
        return new ProcessComponent(data as Partial<ProcessComponentData>);
      
      case ComponentType.DECISION:
        return new DecisionComponent(data as Partial<DecisionComponentData>);
      
      case ComponentType.START_END:
        return new StartEndComponent(data as Partial<StartEndComponentData>);
      
      case ComponentType.DATA:
        return new DataComponent(data as Partial<DataComponentData>);
      
      case ComponentType.CUSTOM:
        return new CustomComponent(data as Partial<CustomComponentData>);
      
      default:
        throw new Error(`Type de composant inconnu: ${type}`);
    }
  }

  /**
   * Crée un composant à partir de données JSON
   */
  static fromJSON(json: SerializedComponent): BaseComponent {
    const data = {
      ...json,
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
    };

    return ComponentFactory.create(json.type, data as Partial<ComponentData>);
  }

  /**
   * Méthodes de création rapide pour chaque type
   */
  static createProcess(data?: Partial<ProcessComponentData>): ProcessComponent {
    return new ProcessComponent(data ?? {});
  }

  static createDecision(data?: Partial<DecisionComponentData>): DecisionComponent {
    return new DecisionComponent(data ?? {});
  }

  static createStart(data?: Partial<StartEndComponentData>): StartEndComponent {
    return new StartEndComponent({ ...data, isStart: true });
  }

  static createEnd(data?: Partial<StartEndComponentData>): StartEndComponent {
    return new StartEndComponent({ ...data, isStart: false });
  }

  static createData(data?: Partial<DataComponentData>): DataComponent {
    return new DataComponent(data ?? {});
  }

  static createCustom(data?: Partial<CustomComponentData>): CustomComponent {
    return new CustomComponent(data ?? {});
  }

  /**
   * Crée un composant en copiant un composant existant
   */
  static clone(component: BaseComponent): BaseComponent {
    const data = component.getData();
    return ComponentFactory.create(data.type, { ...data, id: undefined });
  }

  /**
   * Validation de masse de composants
   */
  static validateAll(components: BaseComponent[]): Map<string, string[]> {
    const errors = new Map<string, string[]>();

    components.forEach(component => {
      if (!component.validate()) {
        const componentErrors: string[] = [];
        
        if (!component.id) {
          componentErrors.push('ID manquant');
        }
        
        const position = component.position;
        if (position.width <= 0 || position.height <= 0) {
          componentErrors.push('Dimensions invalides');
        }

        if (componentErrors.length > 0) {
          errors.set(component.id, componentErrors);
        }
      }
    });

    return errors;
  }
}
