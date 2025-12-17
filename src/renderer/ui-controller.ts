import { WizardStore } from '../domain/wizard-store';
import { WizardConfig, Component, WizardStep } from '../domain/wizard-types';
import { ComponentStore } from '../domain/components/component-store';
import { 
  ComponentFactory, 
  ComponentType, 
  BaseComponent, 
  ShapeType,
  ConnectorComponent,
  ArrowDirection,
  ArrowStyle,
  ArrowEndType,
  ConnectorValidationRules,
} from '../domain/components';

/**
 * UIController gère le rendu et les interactions de l'interface
 * Version mise à jour utilisant le nouveau système de composants
 */
export class UIController {
  private wizardStore: WizardStore;
  public componentStores: Map<string, ComponentStore> = new Map();
  private selectedComponentId: string | null = null;
  private contextMenuTargetId: string | null = null;
  private currentStepId: string = '';
  
  // Mode création de connecteur
  private isCreatingConnector: boolean = false;
  private connectorSourceId: string | null = null;
  private tempConnectorLine: SVGLineElement | null = null;
  private svgOverlay: SVGSVGElement | null = null;

  // Elements DOM
  private wizardStepsEl: HTMLElement;
  private wizardContentEl: HTMLElement;
  private stepStatusEl: HTMLElement;
  private stepTitleEl: HTMLElement;
  private stepDescriptionEl: HTMLElement;
  private btnPrevEl: HTMLButtonElement;
  private btnNextEl: HTMLButtonElement;
  private btnExportEl: HTMLButtonElement;
  private componentsSidebarEl: HTMLElement;
  private componentsListEl: HTMLElement;
  private canvasContentEl: HTMLElement;
  private contextMenuEl: HTMLElement;
  private editModalEl: HTMLElement;

  constructor(config: WizardConfig) {
    this.wizardStore = new WizardStore(config);

    // Initialiser un ComponentStore pour chaque step
    config.steps.forEach((step) => {
      this.componentStores.set(step.id, new ComponentStore());
    });

    // Récupérer les éléments DOM avec les bons IDs
    this.wizardStepsEl = document.getElementById('wizard-steps-nav')!;
    this.wizardContentEl = document.querySelector('.step-content')!;
    this.stepStatusEl = document.getElementById('step-status')!;
    this.stepTitleEl = document.getElementById('step-title')!;
    this.stepDescriptionEl = document.getElementById('step-description')!;
    this.btnPrevEl = document.getElementById('btn-prev') as HTMLButtonElement;
    this.btnNextEl = document.getElementById('btn-next') as HTMLButtonElement;
    this.btnExportEl = document.getElementById('btn-export') as HTMLButtonElement;
    this.componentsSidebarEl = document.getElementById('components-sidebar')!;
    this.componentsListEl = document.getElementById('components-list')!;
    this.canvasContentEl = document.getElementById('canvas-content')!;
    this.contextMenuEl = document.getElementById('context-menu')!;
    this.editModalEl = document.getElementById('edit-modal')!;

    this.setupEventListeners();
    this.setupContextMenu();
    this.setupEditModal();
    this.render();
  }

  private setupEventListeners(): void {
    this.btnPrevEl.addEventListener('click', () => this.handlePreviousStep());
    this.btnNextEl.addEventListener('click', () => this.handleNextStep());
    this.btnExportEl.addEventListener('click', () => this.handleExport());
  }

  private render(): void {
    this.renderStepNavigation();
    this.renderStepContent();
    this.updateControls();
  }

  private renderStepNavigation(): void {
    this.wizardStepsEl.innerHTML = '';

    const steps = this.wizardStore.getConfig().steps;
    const currentIndex = this.wizardStore.getCurrentStepIndex();

    steps.forEach((step, index) => {
      const stepEl = document.createElement('div');
      stepEl.className = 'wizard-step';
      
      if (index === currentIndex) {
        stepEl.classList.add('active');
      }
      
      if (!this.wizardStore.canGoToStep(index)) {
        stepEl.classList.add('disabled');
      }

      const numberEl = document.createElement('div');
      numberEl.className = 'wizard-step-number';
      numberEl.textContent = `${index + 1}`;
      stepEl.appendChild(numberEl);

      const titleEl = document.createElement('div');
      titleEl.className = 'wizard-step-title';
      titleEl.textContent = step.title;
      stepEl.appendChild(titleEl);

      // Ajouter l'indicateur d'état
      const indicator = document.createElement('span');
      indicator.className = 'wizard-step-indicator';
      
      if (index < currentIndex) {
        // Étape précédente : vérifier si valide
        if (this.wizardStore.isStepValid(index)) {
          indicator.classList.add('valid');
          indicator.textContent = '✓';
        } else {
          indicator.classList.add('invalid');
          indicator.textContent = '✗';
        }
      } else if (index === currentIndex) {
        // Étape en cours
        indicator.classList.add('pending');
        indicator.textContent = '•';
      }
      
      if (indicator.classList.length > 1) {
        stepEl.appendChild(indicator);
      }

      if (!stepEl.classList.contains('disabled')) {
        stepEl.addEventListener('click', () => {
          if (this.wizardStore.canGoToStep(index)) {
            this.wizardStore.goToStep(index);
            this.render();
          }
        });
      }

      this.wizardStepsEl.appendChild(stepEl);
    });
  }

  private renderStepContent(): void {
    const currentStep = this.wizardStore.getCurrentStep();
    if (!currentStep) return;

    this.stepTitleEl.textContent = currentStep.title;
    this.stepDescriptionEl.textContent = currentStep.description || '';
    this.stepStatusEl.textContent = `Étape ${this.wizardStore.getCurrentStepIndex() + 1} sur ${this.wizardStore.getStepCount()}`;

    // Rendre les composants disponibles dans la liste
    this.renderComponentsList(currentStep);
    
    // Rendre le canvas
    const componentStore = this.componentStores.get(currentStep.id)!;
    this.renderCanvas(componentStore, currentStep.id);
  }

  private renderComponentsList(step: WizardStep): void {
    this.componentsListEl.innerHTML = '';

    step.components.forEach((component) => {
      const item = document.createElement('div');
      item.className = 'component-item';
      item.dataset.componentId = component.id;

      // Les connecteurs ne sont pas draggable
      if (component.category !== 'connector') {
        item.draggable = true;
      }

      const name = document.createElement('div');
      name.className = 'component-item-name';
      name.textContent = component.name;
      item.appendChild(name);

      if (component.description) {
        const desc = document.createElement('div');
        desc.className = 'component-item-desc';
        desc.textContent = component.description;
        item.appendChild(desc);
      }

      // Badge de catégorie
      if (component.category) {
        const badge = document.createElement('span');
        badge.className = `category-badge category-${component.category}`;
        badge.textContent = component.category;
        item.appendChild(badge);
      }

      // Gestion spéciale pour les connecteurs : CLIC au lieu de drag & drop
      if (component.category === 'connector') {
        // Marquer comme actif si le mode connecteur est activé
        if (this.isCreatingConnector) {
          item.classList.add('connector-active');
        }

        // Clic pour activer/désactiver le mode connecteur
        item.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          if (this.isCreatingConnector) {
            // Désactiver le mode
            this.cancelConnectorCreation();
            this.renderComponentsList(step);
          } else {
            // Activer le mode
            this.startConnectorCreationMode(step.id);
            this.renderComponentsList(step);
          }
        });

        // Style de curseur
        item.style.cursor = 'pointer';
      } else {
        // Drag & drop pour les autres composants
        item.addEventListener('dragstart', (e) => {
          const dt = e.dataTransfer!;
          dt.effectAllowed = 'copy';
          dt.setData('application/json', JSON.stringify(component));
        });
      }

      this.componentsListEl.appendChild(item);
    });

    // Ajouter les statistiques
    const stats = document.createElement('div');
    stats.className = 'step-stats';
    const componentStore = this.componentStores.get(step.id)!;
    const storeStats = componentStore.getStats();
    
    stats.innerHTML = `
      <h4>Statistiques</h4>
      <div class="stat-item">
        <span>Total composants:</span>
        <strong>${storeStats.total}</strong>
      </div>
    `;
    
    this.componentsListEl.appendChild(stats);
  }

  private renderCanvas(componentStore: ComponentStore, stepId: string): void {
    this.canvasContentEl.innerHTML = '';

    // Support du drag & drop
    this.canvasContentEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'copy';
    });

    this.canvasContentEl.addEventListener('drop', (e) => {
      e.preventDefault();

      const data = e.dataTransfer!.getData('application/json');
      if (data) {
        const wizardComponent = JSON.parse(data) as Component;
        
        // Les connecteurs ne peuvent pas être drag & drop
        if (wizardComponent.category === 'connector') {
          return;
        }
        
        const rect = this.canvasContentEl.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Créer le composant approprié selon la catégorie
        const component = this.createComponentFromWizardComponent(
          wizardComponent,
          x,
          y,
          stepId
        );

        componentStore.add(component);
        this.renderCanvas(componentStore, stepId);
      }
    });

    this.canvasContentEl.addEventListener('mousedown', () => {
      this.selectedComponentId = null;
      this.renderCanvas(componentStore, stepId);
    });

    // Rendre les composants existants
    const components = componentStore.getByStep(stepId);
    components.forEach((component) => {
      const el = this.createComponentElement(component, componentStore, stepId);
      this.canvasContentEl.appendChild(el);
    });
    
    // Rendre les connecteurs
    this.renderConnectors(componentStore, stepId);
    
    // Ajouter le suivi de la souris pour la ligne temporaire
    if (this.isCreatingConnector) {
      this.canvasContentEl.addEventListener('mousemove', (e) => {
        const rect = this.canvasContentEl.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.updateTempConnectorLine(x, y);
      });
      
      // Annuler avec Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isCreatingConnector) {
          this.cancelConnectorCreation();
        }
      });
    }
  }

  private createComponentFromWizardComponent(
    wizardComponent: Component,
    x: number,
    y: number,
    stepId: string
  ): BaseComponent {
    const category = wizardComponent.category || 'process';
    let component: BaseComponent;

    switch (category) {
      case 'flow':
        // Déterminer si c'est un début ou une fin
        const isStart = wizardComponent.name.toLowerCase().includes('début') || 
                       wizardComponent.name.toLowerCase().includes('start');
        if (isStart) {
          component = ComponentFactory.createStart({
            content: { text: wizardComponent.name },
            position: { x, y, width: 120, height: 60 },
          });
        } else {
          component = ComponentFactory.createEnd({
            content: { text: wizardComponent.name },
            position: { x, y, width: 120, height: 60 },
          });
        }
        break;

      case 'decision':
        component = ComponentFactory.createDecision({
          question: wizardComponent.name,
          content: { text: wizardComponent.name },
          position: { x, y, width: 140, height: 100 },
        });
        break;

      case 'data':
        component = ComponentFactory.createData({
          dataType: 'generic',
          content: { text: wizardComponent.name },
          position: { x, y, width: 160, height: 80 },
        });
        break;

      case 'process':
      default:
        component = ComponentFactory.createProcess({
          processName: wizardComponent.name,
          description: wizardComponent.description,
          content: { text: wizardComponent.name },
          position: { x, y, width: 180, height: 80 },
        });
        break;
    }

    component.addToStep(stepId);
    return component;
  }

  private createComponentElement(
    component: BaseComponent,
    componentStore: ComponentStore,
    stepId: string
  ): HTMLElement {
    const el = document.createElement('div');
    el.className = 'diagram-component';
    el.classList.add(`component-${component.type}`);
    el.classList.add(`shape-${component.shape}`);
    el.dataset.componentId = component.id;

    if (component.id === this.selectedComponentId) {
      el.classList.add('selected');
    }

    // Style de positionnement
    el.style.position = 'absolute';
    el.style.left = `${component.position.x}px`;
    el.style.top = `${component.position.y}px`;
    el.style.width = `${component.position.width}px`;
    el.style.height = `${component.position.height}px`;

    // Style visuel
    if (component.style.fillColor) {
      el.style.backgroundColor = component.style.fillColor;
    }
    if (component.style.strokeColor) {
      el.style.borderColor = component.style.strokeColor;
    }
    if (component.style.strokeWidth) {
      el.style.borderWidth = `${component.style.strokeWidth}px`;
    }
    if (component.style.opacity !== undefined) {
      el.style.opacity = component.style.opacity.toString();
    }

    // Contenu texte
    const textEl = document.createElement('div');
    textEl.className = 'component-text';
    textEl.textContent = component.content.text || '';
    el.appendChild(textEl);

    // Gestion du clic
    el.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      
      // Si on est en mode création de connecteur
      if (this.isCreatingConnector) {
        this.handleConnectorClick(component.id, stepId);
        return;
      }
      
      this.selectedComponentId = component.id;
      this.renderCanvas(componentStore, stepId);
    });

    // Menu contextuel (clic droit)
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showContextMenu(e.clientX, e.clientY, component.id, stepId);
    });

    // Drag & drop pour déplacer
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    el.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // left click
        isDragging = true;
        startX = e.clientX - component.position.x;
        startY = e.clientY - component.position.y;
        el.style.cursor = 'grabbing';
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging && component.id === this.selectedComponentId) {
        const newX = e.clientX - startX;
        const newY = e.clientY - startY;
        component.updatePosition({ x: newX, y: newY });
        el.style.left = `${newX}px`;
        el.style.top = `${newY}px`;
      }
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        el.style.cursor = 'grab';
        componentStore.update(component.id, (c) => {
          c.updatePosition({
            x: component.position.x,
            y: component.position.y
          });
        });
      }
    });

    return el;
  }

  private updateControls(): void {
    const currentIndex = this.wizardStore.getCurrentStepIndex();
    this.btnPrevEl.disabled = currentIndex === 0;
    this.btnNextEl.disabled = currentIndex === this.wizardStore.getStepCount() - 1;
  }

  private handlePreviousStep(): void {
    if (this.wizardStore.getCurrentStepIndex() > 0) {
      this.wizardStore.goToPreviousStep();
      this.render();
    }
  }

  private handleNextStep(): void {
    if (this.wizardStore.getCurrentStepIndex() < this.wizardStore.getStepCount() - 1) {
      this.wizardStore.goToNextStep();
      this.render();
    }
  }

  private handleExport(): void {
    const data: any = {
      config: this.wizardStore.getConfig(),
      steps: {},
    };

    this.componentStores.forEach((store, stepId) => {
      data.steps[stepId] = store.toJSON();
    });

    const json = JSON.stringify(data, null, 2);
    
    // Créer un blob et télécharger
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wizard-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('Export JSON:', json);
  }

  private setupContextMenu(): void {
    // Fermer le menu si on clique ailleurs
    document.addEventListener('click', () => {
      this.contextMenuEl.style.display = 'none';
    });

    // Action modifier
    document.getElementById('context-edit')!.addEventListener('click', () => {
      this.contextMenuEl.style.display = 'none';
      if (this.contextMenuTargetId) {
        this.openEditModal(this.contextMenuTargetId, this.currentStepId);
      }
    });

    // Action supprimer
    document.getElementById('context-delete')!.addEventListener('click', () => {
      this.contextMenuEl.style.display = 'none';
      if (this.contextMenuTargetId) {
        this.deleteComponent(this.contextMenuTargetId, this.currentStepId);
      }
    });
  }

  private showContextMenu(x: number, y: number, componentId: string, stepId: string): void {
    this.contextMenuTargetId = componentId;
    this.currentStepId = stepId;
    
    this.contextMenuEl.style.left = `${x}px`;
    this.contextMenuEl.style.top = `${y}px`;
    this.contextMenuEl.style.display = 'block';
  }

  private deleteComponent(componentId: string, stepId: string): void {
    const componentStore = this.componentStores.get(stepId);
    if (componentStore) {
      componentStore.remove(componentId);
      this.renderCanvas(componentStore, stepId);
    }
  }

  private setupEditModal(): void {
    const closeBtn = document.getElementById('modal-close')!;
    const cancelBtn = document.getElementById('modal-cancel')!;
    const saveBtn = document.getElementById('modal-save')!;

    closeBtn.addEventListener('click', () => this.closeEditModal());
    cancelBtn.addEventListener('click', () => this.closeEditModal());
    saveBtn.addEventListener('click', () => this.saveComponentEdits());

    // Fermer si clic sur le fond
    this.editModalEl.addEventListener('click', (e) => {
      if (e.target === this.editModalEl) {
        this.closeEditModal();
      }
    });
  }

  private openEditModal(componentId: string, stepId: string): void {
    const componentStore = this.componentStores.get(stepId);
    if (!componentStore) return;

    const component = componentStore.get(componentId);
    if (!component) return;

    this.contextMenuTargetId = componentId;
    this.currentStepId = stepId;

    // Remplir les champs
    (document.getElementById('edit-text') as HTMLInputElement).value = component.content.text || '';
    (document.getElementById('edit-equation') as HTMLInputElement).value = component.content.equation || '';
    (document.getElementById('edit-fill-color') as HTMLInputElement).value = component.style.fillColor;
    (document.getElementById('edit-stroke-color') as HTMLInputElement).value = component.style.strokeColor;
    (document.getElementById('edit-stroke-width') as HTMLInputElement).value = component.style.strokeWidth.toString();

    // Ajouter des champs spécifiques selon le type
    const specificFields = document.getElementById('specific-fields')!;
    specificFields.innerHTML = '';

    if (component.type === 'process') {
      const processData = component.toJSON() as any;
      specificFields.innerHTML = `
        <div class="form-group">
          <label for="edit-process-name">Nom du processus :</label>
          <input type="text" id="edit-process-name" class="form-control" value="${processData.processName || ''}" />
        </div>
        <div class="form-group">
          <label for="edit-process-desc">Description :</label>
          <textarea id="edit-process-desc" class="form-control" rows="3">${processData.description || ''}</textarea>
        </div>
      `;
    } else if (component.type === 'decision') {
      const decisionData = component.toJSON() as any;
      specificFields.innerHTML = `
        <div class="form-group">
          <label for="edit-decision-question">Question :</label>
          <input type="text" id="edit-decision-question" class="form-control" value="${decisionData.question || ''}" />
        </div>
      `;
    } else if (component.type === 'data') {
      const dataData = component.toJSON() as any;
      specificFields.innerHTML = `
        <div class="form-group">
          <label for="edit-data-type">Type de données :</label>
          <input type="text" id="edit-data-type" class="form-control" value="${dataData.dataType || ''}" />
        </div>
      `;
    }

    this.editModalEl.style.display = 'flex';
  }

  private closeEditModal(): void {
    this.editModalEl.style.display = 'none';
  }

  private saveComponentEdits(): void {
    if (!this.contextMenuTargetId || !this.currentStepId) return;

    const componentStore = this.componentStores.get(this.currentStepId);
    if (!componentStore) return;

    const component = componentStore.get(this.contextMenuTargetId);
    if (!component) return;

    // Récupérer les valeurs
    const text = (document.getElementById('edit-text') as HTMLInputElement).value;
    const equation = (document.getElementById('edit-equation') as HTMLInputElement).value;
    const fillColor = (document.getElementById('edit-fill-color') as HTMLInputElement).value;
    const strokeColor = (document.getElementById('edit-stroke-color') as HTMLInputElement).value;
    const strokeWidth = parseInt((document.getElementById('edit-stroke-width') as HTMLInputElement).value);

    // Mettre à jour le composant
    component.updateContent({ text, equation });
    component.updateStyle({ fillColor, strokeColor, strokeWidth });

    // Champs spécifiques
    if (component.type === 'process') {
      const processName = (document.getElementById('edit-process-name') as HTMLInputElement)?.value;
      const description = (document.getElementById('edit-process-desc') as HTMLTextAreaElement)?.value;
      if (processName !== undefined) {
        (component as any).processName = processName;
      }
      if (description !== undefined) {
        (component as any).description = description;
      }
    } else if (component.type === 'decision') {
      const question = (document.getElementById('edit-decision-question') as HTMLInputElement)?.value;
      if (question !== undefined) {
        (component as any).question = question;
      }
    } else if (component.type === 'data') {
      const dataType = (document.getElementById('edit-data-type') as HTMLInputElement)?.value;
      if (dataType !== undefined) {
        (component as any).dataType = dataType;
      }
    }

    // Sauvegarder et rafraîchir
    componentStore.update(this.contextMenuTargetId, (c) => c);
    this.renderCanvas(componentStore, this.currentStepId);
    this.closeEditModal();
  }

  // ========================================
  // GESTION DES CONNECTEURS
  // ========================================

  /**
   * Active le mode création de connecteur
   */
  private startConnectorCreationMode(stepId: string): void {
    this.isCreatingConnector = true;
    this.connectorSourceId = null;
    this.currentStepId = stepId;
    
    // Créer un overlay SVG pour dessiner la ligne temporaire
    if (!this.svgOverlay) {
      this.svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.svgOverlay.style.position = 'absolute';
      this.svgOverlay.style.top = '0';
      this.svgOverlay.style.left = '0';
      this.svgOverlay.style.width = '100%';
      this.svgOverlay.style.height = '100%';
      this.svgOverlay.style.pointerEvents = 'none';
      this.svgOverlay.style.zIndex = '1000';
      this.canvasContentEl.appendChild(this.svgOverlay);
    }
    
    // Afficher un message à l'utilisateur
    this.showConnectorMessage('Cliquez sur le composant de départ');
    
    // Changer le curseur
    this.canvasContentEl.style.cursor = 'crosshair';
  }

  /**
   * Annule le mode création de connecteur
   */
  private cancelConnectorCreation(): void {
    this.isCreatingConnector = false;
    this.connectorSourceId = null;
    
    if (this.tempConnectorLine && this.svgOverlay) {
      this.svgOverlay.removeChild(this.tempConnectorLine);
      this.tempConnectorLine = null;
    }
    
    if (this.svgOverlay && this.svgOverlay.parentNode) {
      this.canvasContentEl.removeChild(this.svgOverlay);
      this.svgOverlay = null;
    }
    
    this.canvasContentEl.style.cursor = 'default';
    this.hideConnectorMessage();
    
    // Retirer la classe connector-source de tous les éléments
    const sourceEls = this.canvasContentEl.querySelectorAll('.connector-source');
    sourceEls.forEach(el => el.classList.remove('connector-source'));
    
    // Re-render la liste pour désactiver visuellement le connecteur
    const currentStep = this.wizardStore.getCurrentStep();
    if (currentStep) {
      this.renderComponentsList(currentStep);
    }
  }

  /**
   * Gère le clic sur un composant en mode création de connecteur
   */
  private handleConnectorClick(componentId: string, stepId: string): void {
    const componentStore = this.componentStores.get(stepId);
    if (!componentStore) return;

    const component = componentStore.get(componentId);
    if (!component || component.type === ComponentType.CONNECTOR) {
      return; // Impossible de connecter depuis/vers un connecteur
    }

    if (!this.connectorSourceId) {
      // Premier clic : sélectionner le composant source
      this.connectorSourceId = componentId;
      this.showConnectorMessage('Cliquez sur le composant de destination');
      
      // Marquer visuellement le composant source
      const sourceEl = this.canvasContentEl.querySelector(`[data-component-id="${componentId}"]`) as HTMLElement;
      if (sourceEl) {
        sourceEl.classList.add('connector-source');
      }
    } else {
      // Deuxième clic : créer le connecteur
      if (this.connectorSourceId === componentId) {
        this.showConnectorMessage('Impossible de connecter un composant à lui-même', 'error');
        return;
      }

      const sourceComponent = componentStore.get(this.connectorSourceId);
      if (!sourceComponent) return;

      // Créer le connecteur
      const connector = ComponentFactory.createConnector({
        stepIds: [stepId],
        fromComponentId: this.connectorSourceId,
        toComponentId: componentId,
        arrowStyle: ArrowStyle.SOLID,
        endEndType: ArrowEndType.ARROW,
      });

      // Calculer la direction automatiquement
      const direction = connector.calculateAutoDirection(sourceComponent, component);
      connector.setDirection(direction);

      // Valider le connecteur
      const rule = ConnectorValidationRules.getRule(stepId);
      if (rule) {
        const existingConnectors = componentStore.getAll()
          .filter(c => c.type === ComponentType.CONNECTOR) as ConnectorComponent[];

        const validation = connector.validateInContext(
          rule,
          sourceComponent,
          component,
          existingConnectors
        );

        if (!validation.valid) {
          this.showConnectorMessage(validation.error || 'Connexion invalide', 'error');
          setTimeout(() => this.cancelConnectorCreation(), 2000);
          return;
        }
      }

      // Ajouter le connecteur au store
      componentStore.add(connector);
      
      // Terminer le mode création
      this.cancelConnectorCreation();
      this.renderCanvas(componentStore, stepId);
      this.showConnectorMessage('Connecteur créé avec succès', 'success');
      setTimeout(() => this.hideConnectorMessage(), 2000);
    }
  }

  /**
   * Dessine une ligne temporaire pendant la création
   */
  private updateTempConnectorLine(x: number, y: number): void {
    if (!this.connectorSourceId || !this.svgOverlay || !this.currentStepId) return;

    const componentStore = this.componentStores.get(this.currentStepId);
    if (!componentStore) return;

    const sourceComponent = componentStore.get(this.connectorSourceId);
    if (!sourceComponent) return;

    // Calculer le centre du composant source
    const sourceX = sourceComponent.position.x + sourceComponent.position.width / 2;
    const sourceY = sourceComponent.position.y + sourceComponent.position.height / 2;

    // Supprimer l'ancienne ligne
    if (this.tempConnectorLine) {
      this.svgOverlay.removeChild(this.tempConnectorLine);
    }

    // Créer une nouvelle ligne
    this.tempConnectorLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    this.tempConnectorLine.setAttribute('x1', sourceX.toString());
    this.tempConnectorLine.setAttribute('y1', sourceY.toString());
    this.tempConnectorLine.setAttribute('x2', x.toString());
    this.tempConnectorLine.setAttribute('y2', y.toString());
    this.tempConnectorLine.setAttribute('stroke', '#3498db');
    this.tempConnectorLine.setAttribute('stroke-width', '2');
    this.tempConnectorLine.setAttribute('stroke-dasharray', '5,5');

    this.svgOverlay.appendChild(this.tempConnectorLine);
  }

  /**
   * Affiche un message pour guider l'utilisateur
   */
  private showConnectorMessage(message: string, type: 'info' | 'error' | 'success' = 'info'): void {
    let messageEl = document.getElementById('connector-message');
    
    if (!messageEl) {
      messageEl = document.createElement('div');
      messageEl.id = 'connector-message';
      messageEl.style.position = 'fixed';
      messageEl.style.top = '20px';
      messageEl.style.left = '50%';
      messageEl.style.transform = 'translateX(-50%)';
      messageEl.style.padding = '12px 24px';
      messageEl.style.borderRadius = '4px';
      messageEl.style.fontSize = '14px';
      messageEl.style.fontWeight = '500';
      messageEl.style.zIndex = '10000';
      messageEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      document.body.appendChild(messageEl);
    }

    messageEl.textContent = message;
    
    // Couleurs selon le type
    if (type === 'error') {
      messageEl.style.backgroundColor = '#e74c3c';
      messageEl.style.color = '#fff';
    } else if (type === 'success') {
      messageEl.style.backgroundColor = '#27ae60';
      messageEl.style.color = '#fff';
    } else {
      messageEl.style.backgroundColor = '#3498db';
      messageEl.style.color = '#fff';
    }

    messageEl.style.display = 'block';
  }

  /**
   * Cache le message
   */
  private hideConnectorMessage(): void {
    const messageEl = document.getElementById('connector-message');
    if (messageEl) {
      messageEl.style.display = 'none';
    }
  }

  /**
   * Rend les connecteurs sur le canvas
   */
  private renderConnectors(componentStore: ComponentStore, stepId: string): void {
    const connectors = componentStore.getAll()
      .filter(c => c.type === ComponentType.CONNECTOR) as ConnectorComponent[];

    if (connectors.length === 0) return;

    // Créer ou récupérer le SVG pour les connecteurs
    let svg = this.canvasContentEl.querySelector('svg.connectors-svg') as SVGSVGElement;
    
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.classList.add('connectors-svg');
      svg.style.position = 'absolute';
      svg.style.top = '0';
      svg.style.left = '0';
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.pointerEvents = 'none';
      svg.style.zIndex = '1';
      
      // Définir les marqueurs de flèches
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', 'arrowhead');
      marker.setAttribute('markerWidth', '10');
      marker.setAttribute('markerHeight', '10');
      marker.setAttribute('refX', '9');
      marker.setAttribute('refY', '3');
      marker.setAttribute('orient', 'auto');
      
      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', '0 0, 10 3, 0 6');
      polygon.setAttribute('fill', '#2c5aa0');
      
      marker.appendChild(polygon);
      defs.appendChild(marker);
      svg.appendChild(defs);
      
      this.canvasContentEl.insertBefore(svg, this.canvasContentEl.firstChild);
    } else {
      // Nettoyer les anciennes lignes (garder les defs)
      const lines = svg.querySelectorAll('line, path, text');
      lines.forEach(line => line.remove());
    }

    // Dessiner chaque connecteur
    connectors.forEach(connector => {
      const fromComp = componentStore.get(connector.fromComponentId);
      const toComp = componentStore.get(connector.toComponentId);

      if (!fromComp || !toComp) return;

      // Calculer les points de connexion
      const fromX = fromComp.position.x + fromComp.position.width / 2;
      const fromY = fromComp.position.y + fromComp.position.height / 2;
      const toX = toComp.position.x + toComp.position.width / 2;
      const toY = toComp.position.y + toComp.position.height / 2;

      // Créer la ligne
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', fromX.toString());
      line.setAttribute('y1', fromY.toString());
      line.setAttribute('x2', toX.toString());
      line.setAttribute('y2', toY.toString());
      line.setAttribute('stroke', connector.style.strokeColor);
      line.setAttribute('stroke-width', connector.style.strokeWidth.toString());
      
      // Appliquer le style
      if (connector.arrowStyle === ArrowStyle.DASHED) {
        line.setAttribute('stroke-dasharray', '10,5');
      } else if (connector.arrowStyle === ArrowStyle.DOTTED) {
        line.setAttribute('stroke-dasharray', '2,3');
      }
      
      line.setAttribute('marker-end', 'url(#arrowhead)');
      line.style.pointerEvents = 'all';
      line.style.cursor = 'pointer';
      
      // Événements sur le connecteur
      line.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectedComponentId = connector.id;
        this.renderCanvas(componentStore, stepId);
      });

      line.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showContextMenu(e.clientX, e.clientY, connector.id, stepId);
      });

      svg.appendChild(line);

      // Ajouter le label si présent
      if (connector.label) {
        const labelX = fromX + (toX - fromX) * (connector.labelPosition || 0.5);
        const labelY = fromY + (toY - fromY) * (connector.labelPosition || 0.5);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', labelX.toString());
        text.setAttribute('y', (labelY - 5).toString());
        text.setAttribute('fill', '#2c3e50');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('text-anchor', 'middle');
        text.textContent = connector.label;
        text.style.pointerEvents = 'none';

        svg.appendChild(text);
      }
    });
  }

  // Méthodes publiques pour accès externe
  public getWizardStore(): WizardStore {
    return this.wizardStore;
  }

  public getComponentStore(stepId: string): ComponentStore | undefined {
    return this.componentStores.get(stepId);
  }
}
