/**
 * Point d'entrée pour le module de composants
 * Exporte tous les types, classes et utilitaires nécessaires
 */

// Types
export * from './component-types';

// Classe de base
export { BaseComponent } from './base-component';

// Implémentations concrètes
export { ProcessComponent } from './process-component';
export { DecisionComponent } from './decision-component';
export { StartEndComponent } from './start-end-component';
export { DataComponent } from './data-component';
export { CustomComponent } from './custom-component';
export { 
  ConnectorComponent,
  ArrowDirection,
  ArrowStyle,
  ArrowEndType,
  type ConnectorComponentData,
  type ConnectorValidationRule,
} from './connector-component';

// Factory
export { ComponentFactory } from './component-factory';

// Store
export { ComponentStore, type ComponentFilter } from './component-store';

// Validation des connecteurs
export { 
  ConnectorValidationRules,
  PRESET_VALIDATION_RULES,
} from './connector-validation-rules';
