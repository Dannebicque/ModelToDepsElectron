/**
 * Composant pour les liens (flèches) entre composants
 */

import { BaseComponent } from './base-component';
import {
  ComponentType,
  ShapeType,
  BorderStyle,
  StyleProperties,
} from './component-types';

/**
 * Direction de la flèche pour le rendu graphique
 */
export enum ArrowDirection {
  RIGHT = 'right',       // De gauche à droite
  LEFT = 'left',         // De droite à gauche
  DOWN = 'down',         // De haut en bas
  UP = 'up',             // De bas en haut
  DIAGONAL_DR = 'diagonal-dr', // Diagonal vers bas-droite
  DIAGONAL_DL = 'diagonal-dl', // Diagonal vers bas-gauche
  DIAGONAL_UR = 'diagonal-ur', // Diagonal vers haut-droite
  DIAGONAL_UL = 'diagonal-ul', // Diagonal vers haut-gauche
}

/**
 * Style de la flèche
 */
export enum ArrowStyle {
  SOLID = 'solid',
  DASHED = 'dashed',
  DOTTED = 'dotted',
  DOUBLE = 'double',
}

/**
 * Type de terminaison de flèche
 */
export enum ArrowEndType {
  ARROW = 'arrow',           // Flèche classique >
  TRIANGLE = 'triangle',     // Triangle plein ▶
  CIRCLE = 'circle',         // Cercle ●
  DIAMOND = 'diamond',       // Losange ◆
  NONE = 'none',            // Pas de terminaison
}

/**
 * Interface pour les données spécifiques au composant de lien
 */
export interface ConnectorComponentData extends Omit<import('./component-types').BaseComponentData, 'type' | 'shape'> {
  type: ComponentType.CONNECTOR;
  shape: ShapeType; // Pour la compatibilité, mais non utilisé pour les flèches
  
  // Composants liés
  fromComponentId: string;  // ID du composant de départ
  toComponentId: string;    // ID du composant d'arrivée
  
  // Propriétés de la flèche
  direction: ArrowDirection;
  arrowStyle: ArrowStyle;
  startEndType: ArrowEndType;  // Type de terminaison au départ
  endEndType: ArrowEndType;    // Type de terminaison à l'arrivée
  
  // Points de contrôle pour les courbes (optionnel)
  controlPoints?: Array<{ x: number; y: number }>;
  
  // Propriétés additionnelles
  label?: string;           // Étiquette sur la flèche
  labelPosition?: number;   // Position de l'étiquette (0-1, 0.5 = milieu)
  bidirectional?: boolean;  // Flèche bidirectionnelle
}

/**
 * Règles de validation pour les connecteurs selon le contexte
 */
export interface ConnectorValidationRule {
  stepId: string;
  allowedFromTypes?: ComponentType[];  // Types de composants autorisés comme source
  allowedToTypes?: ComponentType[];    // Types de composants autorisés comme destination
  maxConnectionsFrom?: number;         // Nombre max de connexions sortantes
  maxConnectionsTo?: number;           // Nombre max de connexions entrantes
  forbiddenPairs?: Array<{             // Paires de types interdites
    from: ComponentType;
    to: ComponentType;
  }>;
  requiresBidirectional?: boolean;     // Connexion bidirectionnelle obligatoire
  customValidator?: (connector: ConnectorComponentData, store: any) => { valid: boolean; error?: string };
}

/**
 * Classe pour les composants de lien
 */
export class ConnectorComponent extends BaseComponent<ConnectorComponentData> {
  protected getDefaultType(): ComponentType {
    return ComponentType.CONNECTOR;
  }

  protected getDefaultShape(): ShapeType {
    // Pour les flèches, le shape n'est pas vraiment utilisé
    return ShapeType.RECTANGLE;
  }

  protected getSpecificDefaults(partial: Partial<ConnectorComponentData>): Partial<ConnectorComponentData> {
    return {
      fromComponentId: partial.fromComponentId ?? '',
      toComponentId: partial.toComponentId ?? '',
      direction: partial.direction ?? ArrowDirection.RIGHT,
      arrowStyle: partial.arrowStyle ?? ArrowStyle.SOLID,
      startEndType: partial.startEndType ?? ArrowEndType.NONE,
      endEndType: partial.endEndType ?? ArrowEndType.ARROW,
      controlPoints: partial.controlPoints ?? [],
      labelPosition: partial.labelPosition ?? 0.5,
      bidirectional: partial.bidirectional ?? false,
    };
  }

  /**
   * Valeurs par défaut pour le style des flèches
   */
  protected getDefaultStyle(): StyleProperties {
    return {
      fillColor: 'none',
      strokeColor: '#2c5aa0',
      strokeWidth: 2,
      borderStyle: BorderStyle.SINGLE,
      opacity: 1,
      shadow: false,
    };
  }

  // ========== Getters spécifiques ==========
  
  get fromComponentId(): string {
    return this.data.fromComponentId;
  }

  get toComponentId(): string {
    return this.data.toComponentId;
  }

  get direction(): ArrowDirection {
    return this.data.direction;
  }

  get arrowStyle(): ArrowStyle {
    return this.data.arrowStyle;
  }

  get startEndType(): ArrowEndType {
    return this.data.startEndType;
  }

  get endEndType(): ArrowEndType {
    return this.data.endEndType;
  }

  get controlPoints(): Array<{ x: number; y: number }> {
    return this.data.controlPoints || [];
  }

  get label(): string | undefined {
    return this.data.label;
  }

  get labelPosition(): number {
    return this.data.labelPosition || 0.5;
  }

  get isBidirectional(): boolean {
    return this.data.bidirectional || false;
  }

  // ========== Setters spécifiques ==========

  setFromComponent(componentId: string): this {
    this.data.fromComponentId = componentId;
    this.data.updatedAt = new Date();
    return this;
  }

  setToComponent(componentId: string): this {
    this.data.toComponentId = componentId;
    this.data.updatedAt = new Date();
    return this;
  }

  setDirection(direction: ArrowDirection): this {
    this.data.direction = direction;
    this.data.updatedAt = new Date();
    return this;
  }

  setArrowStyle(style: ArrowStyle): this {
    this.data.arrowStyle = style;
    this.data.updatedAt = new Date();
    return this;
  }

  setEndTypes(start: ArrowEndType, end: ArrowEndType): this {
    this.data.startEndType = start;
    this.data.endEndType = end;
    this.data.updatedAt = new Date();
    return this;
  }

  setControlPoints(points: Array<{ x: number; y: number }>): this {
    this.data.controlPoints = points;
    this.data.updatedAt = new Date();
    return this;
  }

  setLabel(label: string, position: number = 0.5): this {
    this.data.label = label;
    this.data.labelPosition = position;
    this.data.updatedAt = new Date();
    return this;
  }

  setBidirectional(bidirectional: boolean): this {
    this.data.bidirectional = bidirectional;
    this.data.updatedAt = new Date();
    return this;
  }

  // ========== Validation ==========

  /**
   * Validation de base du connecteur
   */
  validate(): boolean {
    if (!this.data.fromComponentId || !this.data.toComponentId) {
      console.error('Le connecteur doit avoir un composant de départ et d\'arrivée');
      return false;
    }

    if (this.data.fromComponentId === this.data.toComponentId) {
      console.error('Un connecteur ne peut pas connecter un composant à lui-même');
      return false;
    }

    if (this.data.labelPosition !== undefined && 
        (this.data.labelPosition < 0 || this.data.labelPosition > 1)) {
      console.error('La position du label doit être entre 0 et 1');
      return false;
    }

    // Validation de base des dimensions et ID
    return (
      this.data.id !== undefined &&
      this.data.id !== '' &&
      this.data.position.width > 0 &&
      this.data.position.height > 0
    );
  }

  /**
   * Validation contextuelle selon les règles du step
   */
  validateInContext(
    rule: ConnectorValidationRule,
    fromComponent: BaseComponent,
    toComponent: BaseComponent,
    existingConnectors: ConnectorComponent[]
  ): { valid: boolean; error?: string } {
    // Vérifier les types autorisés
    if (rule.allowedFromTypes && !rule.allowedFromTypes.includes(fromComponent.type)) {
      return {
        valid: false,
        error: `Le type ${fromComponent.type} n'est pas autorisé comme source dans cette étape`,
      };
    }

    if (rule.allowedToTypes && !rule.allowedToTypes.includes(toComponent.type)) {
      return {
        valid: false,
        error: `Le type ${toComponent.type} n'est pas autorisé comme destination dans cette étape`,
      };
    }

    // Vérifier les paires interdites
    if (rule.forbiddenPairs) {
      const forbidden = rule.forbiddenPairs.find(
        pair => pair.from === fromComponent.type && pair.to === toComponent.type
      );
      if (forbidden) {
        return {
          valid: false,
          error: `La connexion de ${fromComponent.type} vers ${toComponent.type} est interdite dans cette étape`,
        };
      }
    }

    // Vérifier le nombre max de connexions sortantes
    if (rule.maxConnectionsFrom !== undefined) {
      const outgoingCount = existingConnectors.filter(
        c => c.fromComponentId === this.fromComponentId && c.id !== this.id
      ).length;
      if (outgoingCount >= rule.maxConnectionsFrom) {
        return {
          valid: false,
          error: `Le composant source a atteint le nombre maximum de connexions sortantes (${rule.maxConnectionsFrom})`,
        };
      }
    }

    // Vérifier le nombre max de connexions entrantes
    if (rule.maxConnectionsTo !== undefined) {
      const incomingCount = existingConnectors.filter(
        c => c.toComponentId === this.toComponentId && c.id !== this.id
      ).length;
      if (incomingCount >= rule.maxConnectionsTo) {
        return {
          valid: false,
          error: `Le composant destination a atteint le nombre maximum de connexions entrantes (${rule.maxConnectionsTo})`,
        };
      }
    }

    // Vérifier si bidirectionnel est requis
    if (rule.requiresBidirectional && !this.isBidirectional) {
      return {
        valid: false,
        error: `Les connexions doivent être bidirectionnelles dans cette étape`,
      };
    }

    // Validation personnalisée
    if (rule.customValidator) {
      return rule.customValidator(this.data, { fromComponent, toComponent, existingConnectors });
    }

    return { valid: true };
  }

  // ========== Méthodes utilitaires ==========

  /**
   * Calcule la direction automatiquement selon les positions des composants
   */
  calculateAutoDirection(fromComponent: BaseComponent, toComponent: BaseComponent): ArrowDirection {
    const fromX = fromComponent.position.x;
    const fromY = fromComponent.position.y;
    const toX = toComponent.position.x;
    const toY = toComponent.position.y;

    const deltaX = toX - fromX;
    const deltaY = toY - fromY;

    // Calculer l'angle
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    // Déterminer la direction selon l'angle
    if (angle >= -22.5 && angle < 22.5) return ArrowDirection.RIGHT;
    if (angle >= 22.5 && angle < 67.5) return ArrowDirection.DIAGONAL_DR;
    if (angle >= 67.5 && angle < 112.5) return ArrowDirection.DOWN;
    if (angle >= 112.5 && angle < 157.5) return ArrowDirection.DIAGONAL_DL;
    if (angle >= 157.5 || angle < -157.5) return ArrowDirection.LEFT;
    if (angle >= -157.5 && angle < -112.5) return ArrowDirection.DIAGONAL_UL;
    if (angle >= -112.5 && angle < -67.5) return ArrowDirection.UP;
    if (angle >= -67.5 && angle < -22.5) return ArrowDirection.DIAGONAL_UR;

    return ArrowDirection.RIGHT;
  }

  /**
   * Clone le connecteur
   */
  clone(): ConnectorComponent {
    return new ConnectorComponent({
      ...this.getData(),
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
