/**
 * Store pour gérer la collection de composants
 * Gère la persistance et les opérations CRUD
 */

import { BaseComponent } from './base-component';
import { ComponentFactory } from './component-factory';
import { ComponentType, SerializedComponent, ComponentData } from './component-types';

export interface ComponentFilter {
  type?: ComponentType;
  stepId?: string;
  search?: string;
}

export class ComponentStore {
  private components: Map<string, BaseComponent> = new Map();

  /**
   * Ajouter un composant
   */
  add(component: BaseComponent): this {
    if (!component.validate()) {
      throw new Error(`Composant invalide: ${component.id}`);
    }
    this.components.set(component.id, component);
    return this;
  }

  /**
   * Créer et ajouter un composant
   */
  createAndAdd(type: ComponentType, data?: Partial<ComponentData>): BaseComponent {
    const component = ComponentFactory.create(type, data);
    this.add(component);
    return component;
  }

  /**
   * Récupérer un composant par ID
   */
  get(id: string): BaseComponent | undefined {
    return this.components.get(id);
  }

  /**
   * Récupérer tous les composants
   */
  getAll(): BaseComponent[] {
    return Array.from(this.components.values());
  }

  /**
   * Filtrer les composants
   */
  filter(filter: ComponentFilter): BaseComponent[] {
    let results = this.getAll();

    if (filter.type) {
      results = results.filter(c => c.type === filter.type);
    }

    if (filter.stepId) {
      results = results.filter(c => c.stepIds.includes(filter.stepId!));
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      results = results.filter(c => {
        const content = c.content;
        return (
          content.text?.toLowerCase().includes(searchLower) ||
          content.equation?.toLowerCase().includes(searchLower)
        );
      });
    }

    return results;
  }

  /**
   * Récupérer les composants par étape
   */
  getByStep(stepId: string): BaseComponent[] {
    return this.filter({ stepId });
  }

  /**
   * Récupérer les composants par type
   */
  getByType(type: ComponentType): BaseComponent[] {
    return this.filter({ type });
  }

  /**
   * Supprimer un composant
   */
  remove(id: string): boolean {
    return this.components.delete(id);
  }

  /**
   * Mettre à jour un composant
   */
  update(id: string, updater: (component: BaseComponent) => void): BaseComponent | undefined {
    const component = this.get(id);
    if (component) {
      updater(component);
      if (!component.validate()) {
        throw new Error(`Le composant ${id} est devenu invalide après la mise à jour`);
      }
    }
    return component;
  }

  /**
   * Vider le store
   */
  clear(): this {
    this.components.clear();
    return this;
  }

  /**
   * Nombre de composants
   */
  get count(): number {
    return this.components.size;
  }

  /**
   * Vérifier l'existence d'un composant
   */
  has(id: string): boolean {
    return this.components.has(id);
  }

  /**
   * Cloner un composant
   */
  clone(id: string): BaseComponent | undefined {
    const original = this.get(id);
    if (!original) return undefined;

    const cloned = ComponentFactory.clone(original);
    this.add(cloned);
    return cloned;
  }

  /**
   * Sérialisation JSON
   */
  toJSON(): SerializedComponent[] {
    return this.getAll().map(c => c.toJSON());
  }

  /**
   * Désérialisation JSON
   */
  fromJSON(data: SerializedComponent[]): this {
    this.clear();
    data.forEach(item => {
      try {
        const component = ComponentFactory.fromJSON(item);
        this.add(component);
      } catch (error) {
        console.error(`Erreur lors de la désérialisation du composant ${item.id}:`, error);
      }
    });
    return this;
  }

  /**
   * Sauvegarder dans localStorage
   */
  save(key: string = 'components'): void {
    try {
      const json = JSON.stringify(this.toJSON());
      localStorage.setItem(key, json);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw new Error('Impossible de sauvegarder les composants');
    }
  }

  /**
   * Charger depuis localStorage
   */
  load(key: string = 'components'): this {
    try {
      const json = localStorage.getItem(key);
      if (json) {
        const data = JSON.parse(json);
        this.fromJSON(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      throw new Error('Impossible de charger les composants');
    }
    return this;
  }

  /**
   * Exporter en JSON string
   */
  export(): string {
    return JSON.stringify(this.toJSON(), null, 2);
  }

  /**
   * Importer depuis JSON string
   */
  import(jsonString: string): this {
    const data = JSON.parse(jsonString);
    return this.fromJSON(data);
  }

  /**
   * Statistiques
   */
  getStats(): Record<string, number> {
    const stats: Record<string, number> = {
      total: this.count,
    };

    Object.values(ComponentType).forEach(type => {
      stats[type] = this.getByType(type).length;
    });

    return stats;
  }
}
