// ========================================
// CONFIGURATION DU WIZARD
// ========================================

interface Step {
  id: string;
  title: string;
  description: string;
  components: Component[];
  validate?: () => boolean;
}

interface Component {
  id: string;
  name: string;
  description: string;
  type: 'rectangle' | 'arrow';
}

const STEPS: Step[] = [
  {
    id: 'step-1',
    title: 'Architecture Générale',
    description: 'Définissez les composants principaux de votre système',
    components: [
      { id: 'db', name: 'Base de données', description: 'Stockage de données', type: 'rectangle' },
      { id: 'api', name: 'API', description: 'Interface de programmation', type: 'rectangle' },
      { id: 'ui', name: 'Interface Web', description: 'Frontend utilisateur', type: 'rectangle' },
    ],
    validate: () => canvasData[0].nodes.length > 0,
  },
  {
    id: 'step-2',
    title: 'Couche Données',
    description: 'Configurez votre infrastructure de données',
    components: [
      { id: 'sql', name: 'SQL Database', description: 'Base relationnelle', type: 'rectangle' },
      { id: 'nosql', name: 'NoSQL Database', description: 'Base non-relationnelle', type: 'rectangle' },
      { id: 'cache', name: 'Cache', description: 'Redis/Memcached', type: 'rectangle' },
    ],
    validate: () => canvasData[1].nodes.length > 0,
  },
  {
    id: 'step-3',
    title: 'Services Backend',
    description: 'Ajoutez vos services et microservices',
    components: [
      { id: 'auth', name: 'Authentification', description: 'Service d\'auth', type: 'rectangle' },
      { id: 'api-gateway', name: 'API Gateway', description: 'Point d\'entrée', type: 'rectangle' },
      { id: 'queue', name: 'Message Queue', description: 'File de messages', type: 'rectangle' },
    ],
    validate: () => canvasData[2].nodes.length > 0,
  },
  {
    id: 'step-4',
    title: 'Frontend & UI',
    description: 'Définissez vos interfaces utilisateur',
    components: [
      { id: 'web-app', name: 'Application Web', description: 'SPA/MPA', type: 'rectangle' },
      { id: 'mobile', name: 'Application Mobile', description: 'iOS/Android', type: 'rectangle' },
      { id: 'admin', name: 'Interface Admin', description: 'Backoffice', type: 'rectangle' },
    ],
  },
  {
    id: 'step-5',
    title: 'Sécurité & Monitoring',
    description: 'Ajoutez la sécurité et la surveillance',
    components: [
      { id: 'firewall', name: 'Firewall', description: 'Protection réseau', type: 'rectangle' },
      { id: 'monitoring', name: 'Monitoring', description: 'Surveillance', type: 'rectangle' },
      { id: 'logs', name: 'Logs', description: 'Journalisation', type: 'rectangle' },
    ],
  },
];

// ========================================
// ÉTAT DE L'APPLICATION
// ========================================

let currentStepIndex = 0;
const canvasData: Array<{ nodes: any[] }> = STEPS.map(() => ({ nodes: [] }));

// État du zoom et du pan
let zoom = 1;
let panX = 0;
let panY = 0;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;

// ========================================
// INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('Application démarrée');
  initWizard();
  renderStep();
  updateNavigation();
  initZoomControls();
  initCanvasPan();
});

// ========================================
// RENDU DU WIZARD
// ========================================

function initWizard() {
  const stepsNav = document.getElementById('wizard-steps-nav')!;

  STEPS.forEach((step, index) => {
    const stepEl = document.createElement('div');
    stepEl.className = 'wizard-step';
    if (index === currentStepIndex) stepEl.classList.add('active');
    if (!canAccessStep(index)) stepEl.classList.add('disabled');

    stepEl.innerHTML = `
      <span class="wizard-step-number">Étape ${index + 1}/${STEPS.length}</span>
      <span class="wizard-step-title">${step.title}</span>
      <span class="wizard-step-indicator ${getStepStatus(index)}">${getStatusIcon(index)}</span>
    `;

    stepEl.addEventListener('click', () => {
      if (canAccessStep(index)) {
        currentStepIndex = index;
        renderStep();
        updateWizard();
      }
    });

    stepsNav.appendChild(stepEl);
  });
}

function getStepStatus(index: number): string {
  const step = STEPS[index];
  if (step.validate && step.validate()) return 'valid';
  if (index < currentStepIndex) return 'valid';
  return 'pending';
}

function getStatusIcon(index: number): string {
  const status = getStepStatus(index);
  if (status === 'valid') return '✓';
  if (status === 'invalid') return '✕';
  return '⏳';
}

function canAccessStep(index: number): boolean {
  if (index === 0) return true;
  // Vérifier que toutes les étapes précédentes sont valides
  for (let i = 0; i < index; i++) {
    const step = STEPS[i];
    if (step.validate && !step.validate()) return false;
  }
  return true;
}

// ========================================
// RENDU DE L'ÉTAPE ACTUELLE
// ========================================

function renderStep() {
  const step = STEPS[currentStepIndex];

  // Mettre à jour le titre
  document.getElementById('step-title')!.textContent = step.title;
  document.getElementById('step-description')!.textContent = step.description;

  // Rendre les composants
  const componentsList = document.getElementById('components-list')!;
  componentsList.innerHTML = '';

  step.components.forEach((comp) => {
    const compEl = document.createElement('div');
    compEl.className = 'component-item';
    compEl.draggable = true;
    compEl.innerHTML = `
      <div class="component-name">${comp.name}</div>
      <div class="component-desc">${comp.description}</div>
    `;

    compEl.addEventListener('dragstart', (e) => {
      e.dataTransfer!.setData('component', JSON.stringify(comp));
    });

    componentsList.appendChild(compEl);
  });

  // Rendre le canvas et configurer le drag & drop
  renderCanvas();
  setupCanvasDragDrop();
}

function setupCanvasDragDrop() {
  const canvas = document.getElementById('canvas')!;
  
  // Supprimer les anciens listeners en recréant l'élément
  const newCanvas = canvas.cloneNode(true);
  canvas.parentNode!.replaceChild(newCanvas, canvas);
  
  const canvasEl = document.getElementById('canvas')!;
  
  canvasEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'copy';
  });

  canvasEl.addEventListener('drop', (e) => {
    e.preventDefault();
    const data = e.dataTransfer!.getData('component');
    if (data) {
      const comp = JSON.parse(data);
      const rect = canvasEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      addNodeToCanvas(comp, x, y);
    }
  });
  
  // Réinitialiser le pan après le changement
  initCanvasPan();
}

function renderCanvas() {
  const canvasContent = document.getElementById('canvas-content')!;
  canvasContent.innerHTML = '';

  // Afficher les nœuds existants
  canvasData[currentStepIndex].nodes.forEach((node) => {
    createNodeElement(node);
  });

  updateNavigation();
  updateCanvasTransform();
}

// ========================================
// GESTION DU ZOOM ET PAN
// ========================================

function updateCanvasTransform() {
  const canvasContent = document.getElementById('canvas-content')!;
  const zoomLevel = document.getElementById('zoom-level')!;
  
  canvasContent.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
  
  // Mettre à jour l'affichage du niveau de zoom
  zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
  
  // Mettre à jour la taille de la grille en fonction du zoom
  const gridSize = 20 * zoom;
  canvasContent.style.backgroundSize = `${gridSize}px ${gridSize}px`;
  canvasContent.style.backgroundPosition = `${panX}px ${panY}px`;
}

function initZoomControls() {
  const btnZoomIn = document.getElementById('btn-zoom-in')!;
  const btnZoomOut = document.getElementById('btn-zoom-out')!;
  const btnZoomReset = document.getElementById('btn-zoom-reset')!;
  const btnZoomFit = document.getElementById('btn-zoom-fit')!;

  btnZoomIn.addEventListener('click', () => zoomIn());
  btnZoomOut.addEventListener('click', () => zoomOut());
  btnZoomReset.addEventListener('click', () => resetZoom());
  btnZoomFit.addEventListener('click', () => fitToView());

  // Raccourcis clavier
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        zoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        resetZoom();
      }
    }
  });

  // Zoom avec molette
  const canvas = document.getElementById('canvas')!;
  canvas.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(zoom + delta);
    }
  });
}

function zoomIn() {
  setZoom(zoom + 0.1);
}

function zoomOut() {
  setZoom(zoom - 0.1);
}

function setZoom(newZoom: number) {
  zoom = Math.max(0.1, Math.min(5, newZoom)); // Limiter entre 10% et 500%
  updateCanvasTransform();
}

function resetZoom() {
  zoom = 1;
  panX = 0;
  panY = 0;
  updateCanvasTransform();
}

function fitToView() {
  const canvas = document.getElementById('canvas')!;
  const nodes = canvasData[currentStepIndex].nodes;
  
  if (nodes.length === 0) {
    resetZoom();
    return;
  }

  // Calculer les limites du contenu
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  nodes.forEach((node: any) => {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + 120); // largeur approximative du nœud
    maxY = Math.max(maxY, node.y + 60);  // hauteur approximative du nœud
  });

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  const canvasRect = canvas.getBoundingClientRect();
  
  // Calculer le zoom pour ajuster le contenu
  const zoomX = (canvasRect.width - 100) / contentWidth;
  const zoomY = (canvasRect.height - 100) / contentHeight;
  zoom = Math.min(zoomX, zoomY, 1); // Ne pas zoomer au-delà de 100%

  // Centrer le contenu
  panX = (canvasRect.width - contentWidth * zoom) / 2 - minX * zoom;
  panY = (canvasRect.height - contentHeight * zoom) / 2 - minY * zoom;
  
  updateCanvasTransform();
}

function initCanvasPan() {
  const canvas = document.getElementById('canvas')!;

  canvas.addEventListener('mousedown', (e) => {
    // Vérifier si c'est un clic sur le canvas et pas sur un nœud
    if (e.target === canvas || (e.target as HTMLElement).id === 'canvas-content') {
      isPanning = true;
      panStartX = e.clientX - panX;
      panStartY = e.clientY - panY;
      canvas.classList.add('panning');
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isPanning) {
      panX = e.clientX - panStartX;
      panY = e.clientY - panStartY;
      updateCanvasTransform();
    }
  });

  document.addEventListener('mouseup', () => {
    if (isPanning) {
      isPanning = false;
      canvas.classList.remove('panning');
    }
  });
}

function addNodeToCanvas(comp: Component, x: number, y: number) {
  // Convertir les coordonnées écran en coordonnées canvas (tenir compte du zoom et pan)
  const adjustedX = (x - panX) / zoom;
  const adjustedY = (y - panY) / zoom;
  
  const node = {
    id: `node-${Date.now()}`,
    component: comp,
    x: adjustedX,
    y: adjustedY,
  };

  canvasData[currentStepIndex].nodes.push(node);
  createNodeElement(node);
  updateWizard();
  updateNavigation();
}

function createNodeElement(node: any) {
  const canvasContent = document.getElementById('canvas-content')!;
  const nodeEl = document.createElement('div');
  nodeEl.className = 'diagram-node';
  nodeEl.style.left = `${node.x}px`;
  nodeEl.style.top = `${node.y}px`;
  nodeEl.textContent = node.component.name;

  // Drag pour déplacer
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  nodeEl.addEventListener('mousedown', (e) => {
    e.stopPropagation(); // Empêcher le pan du canvas
    isDragging = true;
    startX = e.clientX / zoom - node.x;
    startY = e.clientY / zoom - node.y;
    nodeEl.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      node.x = e.clientX / zoom - startX;
      node.y = e.clientY / zoom - startY;
      nodeEl.style.left = `${node.x}px`;
      nodeEl.style.top = `${node.y}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      nodeEl.style.cursor = 'move';
    }
  });

  canvasContent.appendChild(nodeEl);
}

// ========================================
// NAVIGATION
// ========================================

function updateNavigation() {
  const btnPrev = document.getElementById('btn-prev') as HTMLButtonElement;
  const btnNext = document.getElementById('btn-next') as HTMLButtonElement;
  const status = document.getElementById('step-status')!;

  btnPrev.disabled = currentStepIndex === 0;
  btnNext.disabled = currentStepIndex === STEPS.length - 1;

  const step = STEPS[currentStepIndex];
  if (step.validate) {
    const isValid = step.validate();
    if (isValid) {
      status.textContent = 'Étape validée ✓';
      status.className = 'step-status-message success';
    } else {
      status.textContent = 'Au moins un composant requis';
      status.className = 'step-status-message error';
    }
  } else {
    status.textContent = `Étape ${currentStepIndex + 1}/${STEPS.length}`;
    status.className = 'step-status-message info';
  }

  btnPrev.addEventListener('click', () => {
    if (currentStepIndex > 0) {
      currentStepIndex--;
      renderStep();
      updateWizard();
    }
  });

  btnNext.addEventListener('click', () => {
    if (currentStepIndex < STEPS.length - 1) {
      const canProceed = !step.validate || step.validate();
      if (canProceed) {
        currentStepIndex++;
        renderStep();
        updateWizard();
      } else {
        alert('Veuillez valider cette étape avant de continuer');
      }
    }
  });
}

function updateWizard() {
  const stepsNav = document.getElementById('wizard-steps-nav')!;
  const stepEls = stepsNav.querySelectorAll('.wizard-step');

  stepEls.forEach((el, index) => {
    el.classList.remove('active', 'disabled');
    if (index === currentStepIndex) el.classList.add('active');
    if (!canAccessStep(index)) el.classList.add('disabled');

    const indicator = el.querySelector('.wizard-step-indicator')!;
    indicator.className = `wizard-step-indicator ${getStepStatus(index)}`;
    indicator.textContent = getStatusIcon(index);
  });

  updateNavigation();
}

// ========================================
// EXPORT
// ========================================

document.getElementById('btn-export')?.addEventListener('click', () => {
  const data = {
    steps: STEPS.map((step, index) => ({
      id: step.id,
      title: step.title,
      nodes: canvasData[index].nodes,
    })),
  };
  console.log('Export:', JSON.stringify(data, null, 2));
  alert('Données exportées dans la console');
});

