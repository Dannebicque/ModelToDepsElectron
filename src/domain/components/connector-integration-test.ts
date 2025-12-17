/**
 * Test d'intégration du système de ConnectorComponent
 * Démontre un exemple complet d'utilisation
 */

import {
  ComponentFactory,
  ComponentStore,
  ComponentType,
  ConnectorValidationRules,
  ArrowDirection,
  ArrowStyle,
  ArrowEndType,
  ConnectorComponent,
} from './index';

/**
 * Exemple complet : Création d'un diagramme de flux simple avec validation
 */
export function runConnectorIntegrationTest() {
  console.log('=== Test d\'intégration ConnectorComponent ===\n');

  // 1. Créer le store
  const store = new ComponentStore();

  // 2. Définir les règles de validation pour cette étape
  const stepId = 'example-flowchart';
  ConnectorValidationRules.registerRule(stepId, {
    stepId,
    allowedFromTypes: [
      ComponentType.START_END,
      ComponentType.PROCESS,
      ComponentType.DECISION,
    ],
    allowedToTypes: [
      ComponentType.START_END,
      ComponentType.PROCESS,
      ComponentType.DECISION,
    ],
    maxConnectionsFrom: 5,
    maxConnectionsTo: 5,
    forbiddenPairs: [
      { from: ComponentType.START_END, to: ComponentType.START_END },
    ],
  });

  // 3. Créer les composants
  console.log('Création des composants...');
  
  const startComponent = ComponentFactory.createStart({
    stepIds: [stepId],
    position: { x: 100, y: 100, width: 100, height: 50, rotation: 0 },
    content: { text: 'Début' },
  });
  console.log(`✓ Composant START créé: ${startComponent.id}`);

  const processComponent = ComponentFactory.createProcess({
    stepIds: [stepId],
    position: { x: 300, y: 100, width: 150, height: 80, rotation: 0 },
    content: { text: 'Traiter données' },
  });
  console.log(`✓ Composant PROCESS créé: ${processComponent.id}`);

  const decisionComponent = ComponentFactory.createDecision({
    stepIds: [stepId],
    position: { x: 550, y: 100, width: 120, height: 120, rotation: 0 },
    content: { text: 'Valide ?' },
  });
  console.log(`✓ Composant DECISION créé: ${decisionComponent.id}`);

  const processYes = ComponentFactory.createProcess({
    stepIds: [stepId],
    position: { x: 750, y: 50, width: 100, height: 80, rotation: 0 },
    content: { text: 'Continuer' },
  });
  console.log(`✓ Composant PROCESS créé: ${processYes.id}`);

  const processNo = ComponentFactory.createProcess({
    stepIds: [stepId],
    position: { x: 750, y: 200, width: 100, height: 80, rotation: 0 },
    content: { text: 'Corriger' },
  });
  console.log(`✓ Composant PROCESS créé: ${processNo.id}`);

  const endComponent = ComponentFactory.createEnd({
    stepIds: [stepId],
    position: { x: 950, y: 100, width: 100, height: 50, rotation: 0 },
    content: { text: 'Fin' },
  });
  console.log(`✓ Composant END créé: ${endComponent.id}`);

  // 4. Ajouter les composants au store
  store
    .add(startComponent)
    .add(processComponent)
    .add(decisionComponent)
    .add(processYes)
    .add(processNo)
    .add(endComponent);

  console.log(`\n✓ ${store.getAll().length} composants ajoutés au store\n`);

  // 5. Créer les connecteurs
  console.log('Création des connecteurs...');

  // Start -> Process
  const conn1 = ComponentFactory.createConnector({
    stepIds: [stepId],
    fromComponentId: startComponent.id,
    toComponentId: processComponent.id,
    direction: ArrowDirection.RIGHT,
    arrowStyle: ArrowStyle.SOLID,
    endEndType: ArrowEndType.ARROW,
  });

  if (conn1.validate()) {
    store.add(conn1);
    console.log(`✓ Connecteur START → PROCESS créé`);
  }

  // Process -> Decision
  const conn2 = ComponentFactory.createConnector({
    stepIds: [stepId],
    fromComponentId: processComponent.id,
    toComponentId: decisionComponent.id,
    direction: ArrowDirection.RIGHT,
    arrowStyle: ArrowStyle.SOLID,
    endEndType: ArrowEndType.ARROW,
  });

  if (conn2.validate()) {
    store.add(conn2);
    console.log(`✓ Connecteur PROCESS → DECISION créé`);
  }

  // Decision -> ProcessYes (avec label "Oui")
  const conn3 = ComponentFactory.createConnector({
    stepIds: [stepId],
    fromComponentId: decisionComponent.id,
    toComponentId: processYes.id,
    direction: ArrowDirection.DIAGONAL_UR,
    arrowStyle: ArrowStyle.SOLID,
    endEndType: ArrowEndType.ARROW,
  });
  conn3.setLabel('Oui', 0.5);

  if (conn3.validate()) {
    store.add(conn3);
    console.log(`✓ Connecteur DECISION → PROCESS (Oui) créé avec label`);
  }

  // Decision -> ProcessNo (avec label "Non")
  const conn4 = ComponentFactory.createConnector({
    stepIds: [stepId],
    fromComponentId: decisionComponent.id,
    toComponentId: processNo.id,
    direction: ArrowDirection.DIAGONAL_DR,
    arrowStyle: ArrowStyle.SOLID,
    endEndType: ArrowEndType.ARROW,
  });
  conn4.setLabel('Non', 0.5);

  if (conn4.validate()) {
    store.add(conn4);
    console.log(`✓ Connecteur DECISION → PROCESS (Non) créé avec label`);
  }

  // ProcessYes -> End
  const conn5 = ComponentFactory.createConnector({
    stepIds: [stepId],
    fromComponentId: processYes.id,
    toComponentId: endComponent.id,
    direction: ArrowDirection.DIAGONAL_DR,
    arrowStyle: ArrowStyle.SOLID,
    endEndType: ArrowEndType.ARROW,
  });

  if (conn5.validate()) {
    store.add(conn5);
    console.log(`✓ Connecteur PROCESS → END créé`);
  }

  // ProcessNo -> Process (boucle de correction)
  const conn6 = ComponentFactory.createConnector({
    stepIds: [stepId],
    fromComponentId: processNo.id,
    toComponentId: processComponent.id,
    direction: ArrowDirection.LEFT,
    arrowStyle: ArrowStyle.DASHED,
    endEndType: ArrowEndType.ARROW,
  });
  conn6.setLabel('Retour', 0.5);

  if (conn6.validate()) {
    store.add(conn6);
    console.log(`✓ Connecteur PROCESS → PROCESS (boucle) créé`);
  }

  // 6. Validation contextuelle
  console.log('\n=== Validation contextuelle ===');
  const rule = ConnectorValidationRules.getRule(stepId);
  const allConnectors = store.getAll()
    .filter(c => c.type === ComponentType.CONNECTOR) as ConnectorComponent[];

  console.log(`Nombre de connecteurs : ${allConnectors.length}`);

  let validConnectors = 0;
  allConnectors.forEach(connector => {
    const fromComp = store.get(connector.fromComponentId);
    const toComp = store.get(connector.toComponentId);

    if (fromComp && toComp && rule) {
      const validation = connector.validateInContext(
        rule,
        fromComp,
        toComp,
        allConnectors.filter(c => c.id !== connector.id)
      );

      if (validation.valid) {
        validConnectors++;
      } else {
        console.log(`✗ Connecteur invalide: ${validation.error}`);
      }
    }
  });

  console.log(`✓ ${validConnectors}/${allConnectors.length} connecteurs valides\n`);

  // 7. Test d'une connexion interdite
  console.log('=== Test de connexion interdite ===');
  const invalidConnector = ComponentFactory.createConnector({
    stepIds: [stepId],
    fromComponentId: startComponent.id,
    toComponentId: endComponent.id, // START -> END interdit
  });

  if (rule) {
    const validation = invalidConnector.validateInContext(
      rule,
      startComponent,
      endComponent,
      allConnectors
    );

    if (!validation.valid) {
      console.log(`✓ Connexion correctement refusée : ${validation.error}\n`);
    }
  }

  // 8. Statistiques finales
  console.log('=== Statistiques finales ===');
  console.log(`Composants totaux : ${store.getAll().length}`);
  console.log(`Composants de type CONNECTOR : ${allConnectors.length}`);
  console.log(`Composants de type PROCESS : ${store.getAll().filter(c => c.type === ComponentType.PROCESS).length}`);
  console.log(`Composants de type DECISION : ${store.getAll().filter(c => c.type === ComponentType.DECISION).length}`);
  console.log(`Composants de type START_END : ${store.getAll().filter(c => c.type === ComponentType.START_END).length}`);

  // 9. Retourner les résultats pour tests ultérieurs
  return {
    store,
    components: {
      start: startComponent,
      process: processComponent,
      decision: decisionComponent,
      processYes,
      processNo,
      end: endComponent,
    },
    connectors: allConnectors,
  };
}

// Exécuter le test si ce fichier est importé directement
if (require.main === module) {
  runConnectorIntegrationTest();
}
