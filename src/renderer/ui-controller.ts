import { WizardStore } from '../domain/wizard-store';
import { WizardConfig, Component, WizardStep } from '../domain/wizard-types';
import { DiagramStore } from '../domain/diagram-stores';
import type { DiagramNode } from '../domain/diagram-types';

/**
 * UIController gère le rendu et les interactions de l'interface
 */
export class UIController {
  private wizardStore: WizardStore;
  private diagramStores: Map<string, DiagramStore> = new Map();
  private selectedNodeId: string | null = null;

  // Elements DOM
  private wizardStepsEl: HTMLElement;
  private wizardContentEl: HTMLElement;
  private stepStatusEl: HTMLElement;
  private stepTitleEl: HTMLElement;
  private stepDescriptionEl: HTMLElement;
  private btnPrevEl: HTMLButtonElement;
  private btnNextEl: HTMLButtonElement;
  private btnExportEl: HTMLButtonElement;

  constructor(config: WizardConfig) {
    this.wizardStore = new WizardStore(config);

    // Initialiser un DiagramStore pour chaque step
    config.steps.forEach((step) => {
      this.diagramStores.set(step.id, new DiagramStore());
    });

    // Récupérer les éléments DOM
    this.wizardStepsEl = document.getElementById('wizard-steps')!;
    this.wizardContentEl = document.getElementById('wizard-content')!;
    this.stepStatusEl = document.getElementById('step-status')!;
    this.stepTitleEl = document.getElementById('step-title')!;
    this.stepDescriptionEl = document.getElementById('step-description')!;
    this.btnPrevEl = document.getElementById('btn-prev-step') as HTMLButtonElement;
    this.btnNextEl = document.getElementById('btn-next-step') as HTMLButtonElement;
    this.btnExportEl = document.getElementById('btn-export-json') as HTMLButtonElement;

    console.log('UIController initialized');
    console.log('wizard-steps element:', this.wizardStepsEl);
    console.log('Config steps count:', config.steps.length);

    this.setupEventListeners();
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
    console.log('renderStepNavigation called');
    this.wizardStepsEl.innerHTML = '';

    const steps = this.wizardStore.getConfig().steps;
    console.log('Total steps:', steps.length);

    steps.forEach((step, index) => {
      console.log(`Creating button for step ${index}: ${step.title}`);
      
      const wrapper = document.createElement('div');
      wrapper.className = 'wizard-step-wrapper';

      const button = document.createElement('button');
      button.className = 'wizard-step-button';
      button.disabled = !this.wizardStore.canGoToStep(index);

      if (index === this.wizardStore.getCurrentStepIndex()) {
        button.classList.add('active');
      }

      // Ajouter le titre
      const titleSpan = document.createElement('span');
      titleSpan.textContent = step.title;
      button.appendChild(titleSpan);

      // Ajouter le numéro de l'étape
      const numberSpan = document.createElement('span');
      numberSpan.className = 'wizard-step-number';
      numberSpan.textContent = `${index + 1}/${this.wizardStore.getStepCount()}`;
      button.appendChild(numberSpan);

      // Ajouter l'indicateur de statut
      const indicator = document.createElement('span');
      indicator.className = 'wizard-step-indicator';
      
      if (this.wizardStore.isStepValid(index)) {
        indicator.classList.add('valid');
      } else if (index < this.wizardStore.getCurrentStepIndex()) {
        // Si on est passé à une étape suivante, c'est qu'elle était valide
        indicator.classList.add('valid');
      } else if (index === this.wizardStore.getCurrentStepIndex()) {
        indicator.classList.add('pending');
      } else {
        indicator.classList.add('pending');
      }

      button.appendChild(indicator);

      button.addEventListener('click', () => {
        if (this.wizardStore.goToStep(index)) {
          this.render();
        }
      });

      wrapper.appendChild(button);
      this.wizardStepsEl.appendChild(wrapper);
      
      console.log(`Button added for step ${index}`);
    });
    
    console.log('Final wizardStepsEl HTML:', this.wizardStepsEl.innerHTML.substring(0, 100));
  }

  private renderStepContent(): void {
    this.wizardContentEl.innerHTML = '';

    const currentStep = this.wizardStore.getCurrentStep();
    const diagramStore = this.diagramStores.get(currentStep.id)!;

    // Mettre à jour le titre et la description
    this.stepTitleEl.textContent = `${this.wizardStore.getCurrentStepIndex() + 1}. ${currentStep.title}`;
    this.stepDescriptionEl.textContent = currentStep.description || '';

    // Créer le panel de l'étape
    const panel = document.createElement('div');
    panel.className = 'wizard-step-panel active';

    // Sidebar avec liste de composants
    const sidebar = this.createStepSidebar(currentStep);
    panel.appendChild(sidebar);

    // Zone de dessin
    const canvasArea = this.createCanvasArea(diagramStore, currentStep.id);
    panel.appendChild(canvasArea);

    this.wizardContentEl.appendChild(panel);
  }

  private createStepSidebar(step: WizardStep): HTMLElement {
    const sidebar = document.createElement('div');
    sidebar.className = 'step-sidebar';

    const title = document.createElement('h3');
    title.textContent = 'Composants disponibles';
    sidebar.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'components-list';

    step.components.forEach((component) => {
      const item = document.createElement('li');
      item.className = 'component-item';
      item.draggable = true;
      item.dataset.componentId = component.id;

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

      // Drag & drop
      item.addEventListener('dragstart', (e) => {
        const dt = e.dataTransfer!;
        dt.effectAllowed = 'copy';
        dt.setData('application/json', JSON.stringify(component));
      });

      list.appendChild(item);
    });

    sidebar.appendChild(list);
    return sidebar;
  }

  private createCanvasArea(diagramStore: DiagramStore, stepId: string): HTMLElement {
    const container = document.createElement('div');
    container.className = 'canvas-container';

    const canvas = document.createElement('div');
    canvas.className = 'canvas';
    canvas.id = `canvas-${stepId}`;

    // Support du drag & drop
    canvas.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'copy';
      canvas.style.opacity = '0.8';
    });

    canvas.addEventListener('dragleave', () => {
      canvas.style.opacity = '1';
    });

    canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      canvas.style.opacity = '1';

      const data = e.dataTransfer!.getData('application/json');
      if (data) {
        const component = JSON.parse(data) as Component;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const node = diagramStore.addNode({
          label: component.name,
          x: Math.max(0, x),
          y: Math.max(0, y),
        });

        this.renderCanvas(canvas, diagramStore, stepId);
      }
    });

    canvas.addEventListener('mousedown', () => {
      this.selectedNodeId = null;
      this.renderCanvas(canvas, diagramStore, stepId);
    });

    this.renderCanvas(canvas, diagramStore, stepId);
    container.appendChild(canvas);

    return container;
  }

  private renderCanvas(canvas: HTMLElement, diagramStore: DiagramStore, stepId: string): void {
    canvas.innerHTML = '';

    const state = diagramStore.state;

    state.nodes.forEach((node) => {
      const el = document.createElement('div');
      el.className = 'diagram-node';
      el.style.left = `${node.x}px`;
      el.style.top = `${node.y}px`;
      el.style.width = `${node.width}px`;
      el.style.height = `${node.height}px`;
      el.style.backgroundColor = node.color;
      el.dataset.id = node.id;

      if (node.id === this.selectedNodeId) {
        el.classList.add('selected');
      }

      const label = document.createElement('div');
      label.className = 'diagram-node-label';
      label.textContent = node.label;
      el.appendChild(label);

      this.makeDraggable(el, node, diagramStore, canvas);

      el.addEventListener('mousedown', (ev) => {
        ev.stopPropagation();
        this.selectedNodeId = node.id;
        this.renderCanvas(canvas, diagramStore, stepId);
      });

      canvas.appendChild(el);
    });

    // Sauvegarder l'état dans le wizard
    const stepData = this.wizardStore.getCurrentStepData();
    this.wizardStore.updateStepData(stepId, {
      ...stepData,
      diagramNodes: state.nodes,
      diagramEdges: state.edges,
    });
  }

  private makeDraggable(
    el: HTMLDivElement,
    node: DiagramNode,
    diagramStore: DiagramStore,
    canvas: HTMLElement
  ): void {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;

    const onMouseDown = (ev: MouseEvent) => {
      isDragging = true;
      el.style.cursor = 'grabbing';
      startX = ev.clientX;
      startY = ev.clientY;
      originX = node.x;
      originY = node.y;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging) return;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const newX = originX + dx;
      const newY = originY + dy;

      diagramStore.updateNodePosition(node.id, newX, newY);
      el.style.left = `${newX}px`;
      el.style.top = `${newY}px`;
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
      el.style.cursor = 'grab';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    el.addEventListener('mousedown', onMouseDown);
  }

  private updateControls(): void {
    const currentIndex = this.wizardStore.getCurrentStepIndex();
    const stepCount = this.wizardStore.getStepCount();

    // Bouton précédent
    this.btnPrevEl.disabled = currentIndex === 0;

    // Bouton suivant
    this.btnNextEl.disabled = currentIndex === stepCount - 1;

    // Afficher le statut
    this.updateStepStatus();
  }

  private updateStepStatus(): void {
    const currentIndex = this.wizardStore.getCurrentStepIndex();
    const stepCount = this.wizardStore.getStepCount();

    if (this.wizardStore.validateCurrentStep()) {
      this.stepStatusEl.className = 'step-status success';
      this.stepStatusEl.textContent = `Étape ${currentIndex + 1}/${stepCount} - Valide ✓`;
    } else {
      this.stepStatusEl.className = 'step-status error';
      const errors = this.wizardStore.getValidationErrors(currentIndex);
      if (errors.length > 0) {
        this.stepStatusEl.textContent = errors[0];
      } else {
        this.stepStatusEl.textContent = `Étape ${currentIndex + 1}/${stepCount} - Invalide`;
      }
    }
  }

  private handlePreviousStep(): void {
    if (this.wizardStore.goToPreviousStep()) {
      this.render();
    }
  }

  private handleNextStep(): void {
    if (this.wizardStore.validateCurrentStep()) {
      if (this.wizardStore.goToNextStep()) {
        this.render();
      }
    } else {
      alert('Veuillez valider cette étape avant de continuer');
    }
  }

  private handleExport(): void {
    const data = this.wizardStore.exportData();
    console.log(JSON.stringify(data, null, 2));
    alert('Données exportées dans la console');
  }

  // Méthode publique pour mettre à jour la configuration du wizard
  public updateConfig(config: WizardConfig): void {
    // Recréer le wizard store avec la nouvelle configuration
    const currentData = this.wizardStore.exportData();

    // On pourrait implémenter une migration des données ici
    // Pour maintenant, on recrée simplement
    const newStore = new WizardStore(config);
    this.wizardStore = newStore;

    // Réinitialiser les diagram stores
    this.diagramStores.clear();
    config.steps.forEach((step) => {
      this.diagramStores.set(step.id, new DiagramStore());
    });

    this.render();
  }

  public getWizardStore(): WizardStore {
    return this.wizardStore;
  }

  public getDiagramStore(stepId: string): DiagramStore | undefined {
    return this.diagramStores.get(stepId);
  }
}
