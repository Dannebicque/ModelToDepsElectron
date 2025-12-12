/**
 * Exemples d'utilisation du système de composants
 * 
 * Ce fichier démontre comment utiliser la nouvelle architecture de composants
 * pour créer, modifier et gérer des composants dans votre application.
 */

import {
  ComponentFactory,
  ComponentStore,
  ComponentType,
  ShapeType,
  BorderStyle,
  ProcessComponent,
  DecisionComponent,
  BaseComponent,
} from './index';

// ============================================================
// 1. CRÉATION DE COMPOSANTS
// ============================================================

// Méthode 1: Utiliser la factory avec le type
const process1 = ComponentFactory.create(ComponentType.PROCESS, {
  content: { text: 'Initialiser le système' },
  position: { x: 100, y: 100, width: 200, height: 80 },
});

// Méthode 2: Utiliser les méthodes de création rapide
const decision = ComponentFactory.createDecision({
  content: { text: 'Utilisateur connecté?' },
  position: { x: 300, y: 150, width: 180, height: 100 },
});

const start = ComponentFactory.createStart({
  content: { text: 'Début' },
  position: { x: 50, y: 50, width: 120, height: 60 },
});

const end = ComponentFactory.createEnd({
  content: { text: 'Fin' },
  position: { x: 500, y: 400, width: 120, height: 60 },
});

// Méthode 3: Créer directement une instance de classe
const process2 = new ProcessComponent({
  processName: 'Traitement des données',
  description: 'Ce processus traite les données entrantes',
  content: { text: 'Traiter données', equation: 'y = mx + b' },
  position: { x: 200, y: 250, width: 220, height: 100 },
  style: {
    fillColor: '#27ae60',
    strokeColor: '#1e8449',
    strokeWidth: 2,
    borderStyle: BorderStyle.DOUBLE,
    shadow: true,
  },
});

// ============================================================
// 2. MODIFICATION DES COMPOSANTS
// ============================================================

// Modifier la position
process1.updatePosition({ x: 150, y: 120 });

// Modifier le style
decision.updateStyle({
  fillColor: '#f39c12',
  strokeColor: '#d68910',
  borderStyle: BorderStyle.DASHED,
});

// Modifier le contenu
process2.updateContent({
  text: 'Traiter et valider',
  fontSize: 16,
  textColor: '#ffffff',
});

// Méthodes spécifiques au type
process2.setProcessName('Validation des données');
process2.setDescription('Validation et normalisation des données');

decision.setQuestion('Les données sont-elles valides?');
decision.addCondition('Oui');
decision.addCondition('Non');

// Associer à des étapes
process1.addToStep('step-1');
process1.addToStep('step-2');
decision.addToStep('step-2');

// Métadonnées personnalisées
process1.setMetadata('author', 'John Doe');
process1.setMetadata('version', '1.0');

// ============================================================
// 3. GESTION DES COMPOSANTS AVEC LE STORE
// ============================================================

const store = new ComponentStore();

// Ajouter des composants
store.add(start);
store.add(process1);
store.add(decision);
store.add(process2);
store.add(end);

// Créer et ajouter directement
store.createAndAdd(ComponentType.DATA, {
  content: { text: 'Base de données' },
  position: { x: 350, y: 300, width: 160, height: 80 },
});

// Récupérer un composant
const retrievedProcess = store.get(process1.id);
if (retrievedProcess) {
  console.log('Composant trouvé:', retrievedProcess.content.text);
}

// Récupérer tous les composants
const allComponents = store.getAll();
console.log(`Nombre total de composants: ${allComponents.length}`);

// Filtrer les composants
const processComponents = store.getByType(ComponentType.PROCESS);
console.log(`Nombre de processus: ${processComponents.length}`);

const step2Components = store.getByStep('step-2');
console.log(`Composants à l'étape 2: ${step2Components.length}`);

// Recherche par texte
const searchResults = store.filter({ search: 'données' });
console.log(`Résultats de recherche: ${searchResults.length}`);

// Mettre à jour un composant
store.update(process1.id, (component) => {
  component.updatePosition({ x: 200, y: 200 });
  component.updateContent({ text: 'Initialiser (mis à jour)' });
});

// Cloner un composant
const clonedProcess = store.clone(process2.id);
if (clonedProcess) {
  console.log(`Composant cloné: ${clonedProcess.id}`);
}

// Statistiques
const stats = store.getStats();
console.log('Statistiques:', stats);

// ============================================================
// 4. SÉRIALISATION ET SAUVEGARDE
// ============================================================

// Convertir en JSON
const json = store.toJSON();
console.log('Données JSON:', json);

// Exporter en string
const jsonString = store.export();
console.log('Export:', jsonString);

// Sauvegarder dans localStorage
try {
  store.save('my-components');
  console.log('Composants sauvegardés dans localStorage');
} catch (error) {
  console.error('Erreur de sauvegarde:', error);
}

// Charger depuis localStorage
const newStore = new ComponentStore();
try {
  newStore.load('my-components');
  console.log(`${newStore.count} composants chargés depuis localStorage`);
} catch (error) {
  console.error('Erreur de chargement:', error);
}

// Importer depuis JSON string
const importedStore = new ComponentStore();
importedStore.import(jsonString);
console.log(`${importedStore.count} composants importés`);

// ============================================================
// 5. VALIDATION
// ============================================================

// Valider un composant individuel
if (process1.validate()) {
  console.log('Le composant est valide');
} else {
  console.error('Le composant est invalide');
}

// Validation de masse
const validationErrors = ComponentFactory.validateAll(allComponents);
if (validationErrors.size === 0) {
  console.log('Tous les composants sont valides');
} else {
  console.error('Erreurs de validation:', validationErrors);
}

// ============================================================
// 6. EXEMPLE COMPLET: CRÉER UN DIAGRAMME DE FLUX
// ============================================================

function createSampleWorkflow(): ComponentStore {
  const workflowStore = new ComponentStore();

  // Créer les composants du workflow
  const startNode = ComponentFactory.createStart({
    content: { text: 'Démarrer processus' },
    position: { x: 250, y: 50, width: 150, height: 60 },
  });
  startNode.addToStep('step-1');

  const inputProcess = ComponentFactory.createProcess({
    processName: 'Saisie des données',
    content: { text: 'Saisir les informations' },
    position: { x: 250, y: 150, width: 200, height: 80 },
  });
  inputProcess.addToStep('step-1');

  const validationDecision = ComponentFactory.createDecision({
    question: 'Données valides?',
    conditions: ['Oui', 'Non'],
    content: { text: 'Valider' },
    position: { x: 250, y: 280, width: 150, height: 100 },
  });
  validationDecision.addToStep('step-1').addToStep('step-2');

  const processData = ComponentFactory.createProcess({
    processName: 'Traitement',
    content: { text: 'Traiter les données' },
    position: { x: 450, y: 280, width: 180, height: 80 },
  });
  processData.addToStep('step-2');

  const errorProcess = ComponentFactory.createProcess({
    processName: 'Gestion erreur',
    content: { text: 'Afficher erreur' },
    position: { x: 50, y: 280, width: 150, height: 80 },
  });
  errorProcess.addToStep('step-2');

  const endNode = ComponentFactory.createEnd({
    content: { text: 'Terminer' },
    position: { x: 250, y: 450, width: 150, height: 60 },
  });
  endNode.addToStep('step-2').addToStep('step-3');

  // Ajouter au store
  [startNode, inputProcess, validationDecision, processData, errorProcess, endNode].forEach(
    component => workflowStore.add(component)
  );

  return workflowStore;
}

// Créer et utiliser le workflow
const workflow = createSampleWorkflow();
console.log(`Workflow créé avec ${workflow.count} composants`);

// Récupérer les composants de l'étape 1
const step1Components = workflow.getByStep('step-1');
console.log(`Étape 1: ${step1Components.length} composants`);

// Sauvegarder le workflow
workflow.save('sample-workflow');

// ============================================================
// 7. UTILISATION AVEC TYPESCRIPT - TYPE GUARDS
// ============================================================

function processComponent(component: BaseComponent) {
  // Type guard basé sur le type
  if (component.type === ComponentType.PROCESS) {
    // TypeScript sait maintenant que c'est un ProcessComponent
    const processComp = component as ProcessComponent;
    console.log(`Processus: ${processComp.processName}`);
  } else if (component.type === ComponentType.DECISION) {
    const decisionComp = component as DecisionComponent;
    console.log(`Décision: ${decisionComp.question}`);
  }
}

// Utiliser le type guard
allComponents.forEach(processComponent);

export {
  createSampleWorkflow,
  processComponent,
};
