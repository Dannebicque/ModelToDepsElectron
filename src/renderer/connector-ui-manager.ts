/**
 * Exemple d'intégration UI pour les connecteurs
 * Ce fichier montre comment vous pourriez intégrer le système de connecteurs
 * dans votre interface utilisateur
 */

import {
  ComponentFactory,
  ComponentStore,
  ConnectorComponent,
  ConnectorValidationRules,
  ArrowDirection,
  ArrowStyle,
  ArrowEndType,
  ComponentType,
} from '../domain/components';
import { BaseComponent } from '../domain/components/base-component';

/**
 * Gestionnaire UI pour les connecteurs
 * Gère les interactions utilisateur avec les connecteurs
 */
export class ConnectorUIManager {
  private store: ComponentStore;
  private currentStepId: string;
  private selectedFromComponent: BaseComponent | null = null;
  private tempConnector: ConnectorComponent | null = null;

  constructor(store: ComponentStore, currentStepId: string) {
    this.store = store;
    this.currentStepId = currentStepId;
  }

  /**
   * Démarre la création d'un connecteur
   * L'utilisateur clique sur le premier composant
   */
  startConnectorCreation(component: BaseComponent): void {
    if (component.type === ComponentType.CONNECTOR) {
      console.warn('Impossible de créer un connecteur depuis un autre connecteur');
      return;
    }

    this.selectedFromComponent = component;
    console.log(`Connecteur démarré depuis: ${component.id}`);
    
    // Dans votre UI, vous afficheriez un indicateur visuel
    this.highlightComponent(component);
  }

  /**
   * Termine la création d'un connecteur
   * L'utilisateur clique sur le deuxième composant
   */
  completeConnectorCreation(toComponent: BaseComponent): ConnectorComponent | null {
    if (!this.selectedFromComponent) {
      console.warn('Aucun composant source sélectionné');
      return null;
    }

    if (toComponent.type === ComponentType.CONNECTOR) {
      console.warn('Impossible de connecter à un connecteur');
      this.cancelConnectorCreation();
      return null;
    }

    if (toComponent.id === this.selectedFromComponent.id) {
      console.warn('Impossible de connecter un composant à lui-même');
      this.cancelConnectorCreation();
      return null;
    }

    // Créer le connecteur
    const connector = ComponentFactory.createConnector({
      stepIds: [this.currentStepId],
      fromComponentId: this.selectedFromComponent.id,
      toComponentId: toComponent.id,
    });

    // Calculer la direction automatiquement
    const direction = connector.calculateAutoDirection(
      this.selectedFromComponent,
      toComponent
    );
    connector.setDirection(direction);

    // Valider le connecteur
    if (!this.validateConnector(connector, this.selectedFromComponent, toComponent)) {
      this.cancelConnectorCreation();
      return null;
    }

    // Ajouter au store
    this.store.add(connector);

    // Réinitialiser
    this.clearHighlight(this.selectedFromComponent);
    this.selectedFromComponent = null;

    console.log(`✓ Connecteur créé: ${connector.id}`);
    return connector;
  }

  /**
   * Annule la création en cours
   */
  cancelConnectorCreation(): void {
    if (this.selectedFromComponent) {
      this.clearHighlight(this.selectedFromComponent);
      this.selectedFromComponent = null;
    }
    console.log('Création de connecteur annulée');
  }

  /**
   * Valide un connecteur selon les règles du step actuel
   */
  private validateConnector(
    connector: ConnectorComponent,
    fromComponent: BaseComponent,
    toComponent: BaseComponent
  ): boolean {
    // Validation de base
    if (!connector.validate()) {
      this.showError('Le connecteur est invalide');
      return false;
    }

    // Validation contextuelle
    const rule = ConnectorValidationRules.getRule(this.currentStepId);
    if (rule) {
      const existingConnectors = this.store.getAll()
        .filter(c => c.type === ComponentType.CONNECTOR) as ConnectorComponent[];

      const validation = connector.validateInContext(
        rule,
        fromComponent,
        toComponent,
        existingConnectors
      );

      if (!validation.valid) {
        this.showError(validation.error || 'Validation échouée');
        return false;
      }
    }

    return true;
  }

  /**
   * Modifie le label d'un connecteur
   */
  setConnectorLabel(connector: ConnectorComponent, label: string): void {
    connector.setLabel(label, 0.5);
    this.renderConnector(connector);
  }

  /**
   * Modifie le style d'un connecteur
   */
  setConnectorStyle(connector: ConnectorComponent, style: ArrowStyle): void {
    connector.setArrowStyle(style);
    this.renderConnector(connector);
  }

  /**
   * Modifie le type de terminaison
   */
  setConnectorEndType(
    connector: ConnectorComponent,
    startType: ArrowEndType,
    endType: ArrowEndType
  ): void {
    connector.setEndTypes(startType, endType);
    this.renderConnector(connector);
  }

  /**
   * Active/désactive le mode bidirectionnel
   */
  toggleBidirectional(connector: ConnectorComponent): void {
    connector.setBidirectional(!connector.isBidirectional);
    this.renderConnector(connector);
  }

  /**
   * Supprime un connecteur
   */
  deleteConnector(connector: ConnectorComponent): void {
    // Dans votre UI, vous pourriez demander confirmation
    if (confirm('Supprimer ce connecteur ?')) {
      // Le ComponentStore devrait avoir une méthode remove()
      // this.store.remove(connector.id);
      console.log(`Connecteur supprimé: ${connector.id}`);
      this.clearConnectorRendering(connector);
    }
  }

  /**
   * Récupère tous les connecteurs pour le step actuel
   */
  getConnectorsForCurrentStep(): ConnectorComponent[] {
    return this.store.getAll()
      .filter(c => 
        c.type === ComponentType.CONNECTOR && 
        c.stepIds.includes(this.currentStepId)
      ) as ConnectorComponent[];
  }

  /**
   * Récupère les connecteurs d'un composant spécifique
   */
  getConnectorsForComponent(componentId: string): {
    outgoing: ConnectorComponent[];
    incoming: ConnectorComponent[];
  } {
    const allConnectors = this.getConnectorsForCurrentStep();

    return {
      outgoing: allConnectors.filter(c => c.fromComponentId === componentId),
      incoming: allConnectors.filter(c => c.toComponentId === componentId),
    };
  }

  // ========== Méthodes de rendu (à implémenter selon votre UI) ==========

  private highlightComponent(component: BaseComponent): void {
    // TODO: Implémenter le surlignage visuel du composant
    // Par exemple: ajouter une classe CSS, changer la couleur, etc.
    console.log(`Highlighting component: ${component.id}`);
  }

  private clearHighlight(component: BaseComponent): void {
    // TODO: Retirer le surlignage
    console.log(`Clearing highlight: ${component.id}`);
  }

  private renderConnector(connector: ConnectorComponent): void {
    // TODO: Redessiner le connecteur dans l'UI
    // Par exemple: utiliser Canvas, SVG, etc.
    console.log(`Rendering connector: ${connector.id}`);
  }

  private clearConnectorRendering(connector: ConnectorComponent): void {
    // TODO: Effacer le rendu du connecteur
    console.log(`Clearing connector rendering: ${connector.id}`);
  }

  private showError(message: string): void {
    // TODO: Afficher un message d'erreur à l'utilisateur
    // Par exemple: toast, modal, etc.
    console.error(`Error: ${message}`);
    alert(message); // Simple pour l'exemple
  }
}

/**
 * Exemple d'utilisation avec événements de souris
 */
export class ConnectorMouseHandler {
  private uiManager: ConnectorUIManager;
  private isCreatingConnector = false;

  constructor(uiManager: ConnectorUIManager) {
    this.uiManager = uiManager;
  }

  /**
   * Gestion du clic sur un composant
   */
  handleComponentClick(component: BaseComponent): void {
    if (this.isCreatingConnector) {
      // Deuxième clic: terminer le connecteur
      const connector = this.uiManager.completeConnectorCreation(component);
      if (connector) {
        this.isCreatingConnector = false;
      }
    } else {
      // Premier clic: démarrer le connecteur
      this.uiManager.startConnectorCreation(component);
      this.isCreatingConnector = true;
    }
  }

  /**
   * Gestion de l'annulation (Escape)
   */
  handleEscape(): void {
    if (this.isCreatingConnector) {
      this.uiManager.cancelConnectorCreation();
      this.isCreatingConnector = false;
    }
  }

  /**
   * Affiche un preview pendant la création
   */
  handleMouseMove(x: number, y: number): void {
    if (this.isCreatingConnector) {
      // TODO: Dessiner une ligne temporaire de la souris au composant source
      console.log(`Drawing preview line to: ${x}, ${y}`);
    }
  }
}

/**
 * Panneau de propriétés pour éditer un connecteur
 */
export class ConnectorPropertiesPanel {
  private connector: ConnectorComponent | null = null;
  private uiManager: ConnectorUIManager;

  constructor(uiManager: ConnectorUIManager) {
    this.uiManager = uiManager;
  }

  /**
   * Affiche les propriétés d'un connecteur
   */
  showProperties(connector: ConnectorComponent): void {
    this.connector = connector;

    // TODO: Afficher un panneau avec les propriétés éditables
    console.log('=== Propriétés du connecteur ===');
    console.log(`ID: ${connector.id}`);
    console.log(`De: ${connector.fromComponentId}`);
    console.log(`Vers: ${connector.toComponentId}`);
    console.log(`Direction: ${connector.direction}`);
    console.log(`Style: ${connector.arrowStyle}`);
    console.log(`Label: ${connector.label || '(aucun)'}`);
    console.log(`Bidirectionnel: ${connector.isBidirectional}`);
  }

  /**
   * Met à jour le label
   */
  updateLabel(label: string): void {
    if (this.connector) {
      this.uiManager.setConnectorLabel(this.connector, label);
    }
  }

  /**
   * Met à jour le style
   */
  updateStyle(style: ArrowStyle): void {
    if (this.connector) {
      this.uiManager.setConnectorStyle(this.connector, style);
    }
  }

  /**
   * Met à jour les terminaisons
   */
  updateEndTypes(startType: ArrowEndType, endType: ArrowEndType): void {
    if (this.connector) {
      this.uiManager.setConnectorEndType(this.connector, startType, endType);
    }
  }

  /**
   * Toggle bidirectionnel
   */
  toggleBidirectional(): void {
    if (this.connector) {
      this.uiManager.toggleBidirectional(this.connector);
    }
  }

  /**
   * Supprime le connecteur
   */
  deleteConnector(): void {
    if (this.connector) {
      this.uiManager.deleteConnector(this.connector);
      this.connector = null;
    }
  }
}
