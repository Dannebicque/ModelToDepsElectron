/**
 * Règles de validation pour les connecteurs selon le contexte/step
 * Ce fichier permet de définir les contraintes pour chaque étape du wizard
 */

import { ComponentType } from './component-types';
import { ConnectorValidationRule } from './connector-component';

/**
 * Configuration des règles de validation par step
 * Chaque step peut avoir ses propres règles de connexion
 */
export class ConnectorValidationRules {
  private static rules: Map<string, ConnectorValidationRule> = new Map();

  /**
   * Enregistre une règle de validation pour un step
   */
  static registerRule(stepId: string, rule: ConnectorValidationRule): void {
    this.rules.set(stepId, rule);
  }

  /**
   * Récupère la règle de validation pour un step
   */
  static getRule(stepId: string): ConnectorValidationRule | undefined {
    return this.rules.get(stepId);
  }

  /**
   * Supprime une règle
   */
  static removeRule(stepId: string): void {
    this.rules.delete(stepId);
  }

  /**
   * Récupère toutes les règles
   */
  static getAllRules(): Map<string, ConnectorValidationRule> {
    return new Map(this.rules);
  }

  /**
   * Initialise les règles par défaut pour les steps communs
   */
  static initializeDefaultRules(): void {
    // Exemple : Règles pour un diagramme de flux simple
    this.registerRule('flowchart-step', {
      stepId: 'flowchart-step',
      allowedFromTypes: [
        ComponentType.START_END,
        ComponentType.PROCESS,
        ComponentType.DECISION,
        ComponentType.DATA,
      ],
      allowedToTypes: [
        ComponentType.START_END,
        ComponentType.PROCESS,
        ComponentType.DECISION,
        ComponentType.DATA,
      ],
      forbiddenPairs: [
        // Un START ne peut pas aller vers un START
        { from: ComponentType.START_END, to: ComponentType.START_END },
      ],
      maxConnectionsFrom: 10, // Limite raisonnable
      maxConnectionsTo: 10,
    });

    // Exemple : Règles strictes pour un diagramme de décision
    this.registerRule('decision-tree-step', {
      stepId: 'decision-tree-step',
      allowedFromTypes: [ComponentType.DECISION, ComponentType.START_END],
      allowedToTypes: [ComponentType.DECISION, ComponentType.PROCESS, ComponentType.START_END],
      maxConnectionsFrom: 2, // Une décision a max 2 sorties (oui/non)
      maxConnectionsTo: 1,   // Un nœud ne peut avoir qu'une entrée
      forbiddenPairs: [
        { from: ComponentType.PROCESS, to: ComponentType.DECISION },
      ],
    });

    // Exemple : Règles pour un diagramme de données
    this.registerRule('data-flow-step', {
      stepId: 'data-flow-step',
      allowedFromTypes: [ComponentType.DATA, ComponentType.PROCESS],
      allowedToTypes: [ComponentType.DATA, ComponentType.PROCESS],
      requiresBidirectional: false,
      customValidator: (connector, context) => {
        // Validation personnalisée : un DATA ne peut se connecter qu'à un PROCESS
        const { fromComponent, toComponent } = context;
        
        if (fromComponent.type === ComponentType.DATA && 
            toComponent.type === ComponentType.DATA) {
          return {
            valid: false,
            error: 'Un composant DATA ne peut pas se connecter directement à un autre DATA',
          };
        }

        return { valid: true };
      },
    });

    // Exemple : Règles permissives pour un diagramme custom
    this.registerRule('custom-diagram-step', {
      stepId: 'custom-diagram-step',
      // Pas de restrictions, tout est permis
    });

    // Exemple : Règles pour un réseau de processus
    this.registerRule('process-network-step', {
      stepId: 'process-network-step',
      allowedFromTypes: [ComponentType.PROCESS],
      allowedToTypes: [ComponentType.PROCESS],
      requiresBidirectional: true,
      customValidator: (connector, context) => {
        const { existingConnectors } = context;
        
        // Vérifier qu'il n'y a pas déjà une connexion dans l'autre sens
        const reverseExists = existingConnectors.some(
          (c: any) => c.fromComponentId === connector.toComponentId && 
               c.toComponentId === connector.fromComponentId
        );

        if (reverseExists && !connector.bidirectional) {
          return {
            valid: false,
            error: 'Une connexion inverse existe déjà. Utilisez une connexion bidirectionnelle.',
          };
        }

        return { valid: true };
      },
    });
  }
}

/**
 * Exemples de règles de validation prédéfinies
 */
export const PRESET_VALIDATION_RULES = {
  /**
   * Aucune restriction
   */
  PERMISSIVE: {
    stepId: 'permissive',
  } as ConnectorValidationRule,

  /**
   * Règles strictes de type arbre
   */
  TREE_STRICT: {
    stepId: 'tree-strict',
    maxConnectionsTo: 1,
    customValidator: (connector, context) => {
      const { existingConnectors } = context;
      
      // Détection de cycles
      const visited = new Set<string>();
      const visiting = new Set<string>();

      const hasCycle = (nodeId: string): boolean => {
        if (visiting.has(nodeId)) return true;
        if (visited.has(nodeId)) return false;

        visiting.add(nodeId);

        const children = existingConnectors
          .filter((c: any) => c.fromComponentId === nodeId)
          .map((c: any) => c.toComponentId);

        for (const child of children) {
          if (hasCycle(child)) return true;
        }

        visiting.delete(nodeId);
        visited.add(nodeId);
        return false;
      };

      if (hasCycle(connector.fromComponentId)) {
        return {
          valid: false,
          error: 'Cette connexion créerait un cycle, ce qui est interdit dans un arbre',
        };
      }

      return { valid: true };
    },
  } as ConnectorValidationRule,

  /**
   * Règles pour graphe orienté acyclique (DAG)
   */
  DAG: {
    stepId: 'dag',
    customValidator: (connector, context) => {
      const { existingConnectors } = context;
      
      // Même logique de détection de cycle que TREE_STRICT
      const visited = new Set<string>();
      const visiting = new Set<string>();

      const hasCycle = (nodeId: string): boolean => {
        if (visiting.has(nodeId)) return true;
        if (visited.has(nodeId)) return false;

        visiting.add(nodeId);

        const children = existingConnectors
          .filter((c: any) => c.fromComponentId === nodeId)
          .map((c: any) => c.toComponentId);

        // Ajouter le nouveau connecteur dans la vérification
        if (nodeId === connector.fromComponentId) {
          children.push(connector.toComponentId);
        }

        for (const child of children) {
          if (hasCycle(child)) return true;
        }

        visiting.delete(nodeId);
        visited.add(nodeId);
        return false;
      };

      if (hasCycle(connector.fromComponentId)) {
        return {
          valid: false,
          error: 'Cette connexion créerait un cycle, ce qui est interdit dans un DAG',
        };
      }

      return { valid: true };
    },
  } as ConnectorValidationRule,

  /**
   * Règles pour un diagramme séquentiel
   */
  SEQUENTIAL: {
    stepId: 'sequential',
    maxConnectionsFrom: 1,
    maxConnectionsTo: 1,
    forbiddenPairs: [],
  } as ConnectorValidationRule,
};

// Initialiser les règles par défaut au chargement du module
ConnectorValidationRules.initializeDefaultRules();
