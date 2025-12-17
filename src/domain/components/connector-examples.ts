/**
 * Exemples d'utilisation des ConnectorComponent
 * Démontre comment créer et utiliser des liens entre composants
 */

import { ComponentFactory } from './component-factory';
import { ComponentStore } from './component-store';
import {
  ConnectorComponent,
  ArrowDirection,
  ArrowStyle,
  ArrowEndType,
} from './connector-component';
import { ConnectorValidationRules, PRESET_VALIDATION_RULES } from './connector-validation-rules';
import { ComponentType } from './component-types';

/**
 * Exemple 1 : Création simple d'un connecteur
 */
export function exampleSimpleConnector() {
  const store = new ComponentStore();

  // Créer deux composants
  const startComponent = ComponentFactory.createStart({
    position: { x: 100, y: 100, width: 100, height: 50 },
    content: { text: 'Début' },
  });

  const processComponent = ComponentFactory.createProcess({
    position: { x: 300, y: 100, width: 150, height: 80 },
    content: { text: 'Traitement' },
  });

  store.add(startComponent).add(processComponent);

  // Créer un connecteur entre les deux
  const connector = ComponentFactory.createConnector({
    fromComponentId: startComponent.id,
    toComponentId: processComponent.id,
    direction: ArrowDirection.RIGHT,
    arrowStyle: ArrowStyle.SOLID,
    endEndType: ArrowEndType.ARROW,
  });

  // Valider le connecteur
  if (connector.validate()) {
    store.add(connector);
    console.log('✓ Connecteur créé avec succès');
  }

  return { store, connector };
}

/**
 * Exemple 2 : Connecteur avec calcul automatique de direction
 */
export function exampleAutoDirection() {
  const store = new ComponentStore();

  const comp1 = ComponentFactory.createProcess({
    position: { x: 100, y: 100, width: 100, height: 80 },
    content: { text: 'Processus 1' },
  });

  const comp2 = ComponentFactory.createProcess({
    position: { x: 300, y: 250, width: 100, height: 80 },
    content: { text: 'Processus 2' },
  });

  store.add(comp1).add(comp2);

  const connector = ComponentFactory.createConnector({
    fromComponentId: comp1.id,
    toComponentId: comp2.id,
  });

  // Calculer la direction automatiquement
  const autoDirection = connector.calculateAutoDirection(comp1, comp2);
  connector.setDirection(autoDirection);

  console.log(`Direction calculée : ${autoDirection}`);

  store.add(connector);
  return { store, connector };
}

/**
 * Exemple 3 : Connecteur avec label
 */
export function exampleConnectorWithLabel() {
  const store = new ComponentStore();

  const decision = ComponentFactory.createDecision({
    position: { x: 200, y: 100, width: 120, height: 120 },
    content: { text: 'Condition ?' },
  });

  const processYes = ComponentFactory.createProcess({
    position: { x: 400, y: 100, width: 100, height: 80 },
    content: { text: 'Si Oui' },
  });

  const processNo = ComponentFactory.createProcess({
    position: { x: 400, y: 250, width: 100, height: 80 },
    content: { text: 'Si Non' },
  });

  store.add(decision).add(processYes).add(processNo);

  // Connecteur "Oui"
  const connectorYes = ComponentFactory.createConnector({
    fromComponentId: decision.id,
    toComponentId: processYes.id,
    direction: ArrowDirection.RIGHT,
  });
  connectorYes.setLabel('Oui', 0.5);

  // Connecteur "Non"
  const connectorNo = ComponentFactory.createConnector({
    fromComponentId: decision.id,
    toComponentId: processNo.id,
    direction: ArrowDirection.DIAGONAL_DR,
  });
  connectorNo.setLabel('Non', 0.5);

  store.add(connectorYes).add(connectorNo);

  return { store, connectors: [connectorYes, connectorNo] };
}

/**
 * Exemple 4 : Validation contextuelle d'un connecteur
 */
export function exampleContextualValidation() {
  const store = new ComponentStore();

  // Définir une règle de validation pour ce step
  const stepId = 'example-step';
  ConnectorValidationRules.registerRule(stepId, {
    stepId,
    allowedFromTypes: [ComponentType.START_END, ComponentType.PROCESS],
    allowedToTypes: [ComponentType.PROCESS, ComponentType.START_END],
    maxConnectionsFrom: 2,
    forbiddenPairs: [
      { from: ComponentType.START_END, to: ComponentType.START_END },
    ],
  });

  const start = ComponentFactory.createStart({
    stepIds: [stepId],
  });

  const end = ComponentFactory.createEnd({
    stepIds: [stepId],
  });

  store.add(start).add(end);

  // Tenter de créer une connexion interdite (START -> END)
  const invalidConnector = ComponentFactory.createConnector({
    fromComponentId: start.id,
    toComponentId: end.id,
    stepIds: [stepId],
  });

  const rule = ConnectorValidationRules.getRule(stepId);
  if (rule) {
    const validation = invalidConnector.validateInContext(
      rule,
      start,
      end,
      []
    );

    if (!validation.valid) {
      console.log(`✗ Validation échouée : ${validation.error}`);
    }
  }

  return { store, connector: invalidConnector };
}

/**
 * Exemple 5 : Connecteur bidirectionnel
 */
export function exampleBidirectionalConnector() {
  const store = new ComponentStore();

  const comp1 = ComponentFactory.createProcess({
    position: { x: 100, y: 100, width: 100, height: 80 },
    content: { text: 'Serveur A' },
  });

  const comp2 = ComponentFactory.createProcess({
    position: { x: 300, y: 100, width: 100, height: 80 },
    content: { text: 'Serveur B' },
  });

  store.add(comp1).add(comp2);

  // Créer une connexion bidirectionnelle
  const connector = ComponentFactory.createConnector({
    fromComponentId: comp1.id,
    toComponentId: comp2.id,
    direction: ArrowDirection.RIGHT,
  });

  connector.setBidirectional(true);
  connector.setEndTypes(ArrowEndType.ARROW, ArrowEndType.ARROW);
  connector.setLabel('Communication', 0.5);

  store.add(connector);

  return { store, connector };
}

/**
 * Exemple 6 : Connecteur avec points de contrôle (courbe)
 */
export function exampleCurvedConnector() {
  const store = new ComponentStore();

  const comp1 = ComponentFactory.createProcess({
    position: { x: 100, y: 100, width: 100, height: 80 },
  });

  const comp2 = ComponentFactory.createProcess({
    position: { x: 100, y: 300, width: 100, height: 80 },
  });

  store.add(comp1).add(comp2);

  const connector = ComponentFactory.createConnector({
    fromComponentId: comp1.id,
    toComponentId: comp2.id,
  });

  // Ajouter des points de contrôle pour créer une courbe
  connector.setControlPoints([
    { x: 200, y: 150 },
    { x: 250, y: 200 },
    { x: 200, y: 250 },
  ]);

  store.add(connector);

  return { store, connector };
}

/**
 * Exemple 7 : Validation avec détection de cycle (DAG)
 */
export function exampleDAGValidation() {
  const store = new ComponentStore();

  const stepId = 'dag-example';
  ConnectorValidationRules.registerRule(stepId, PRESET_VALIDATION_RULES.DAG);

  const compA = ComponentFactory.createProcess({
    stepIds: [stepId],
    content: { text: 'A' },
  });
  const compB = ComponentFactory.createProcess({
    stepIds: [stepId],
    content: { text: 'B' },
  });
  const compC = ComponentFactory.createProcess({
    stepIds: [stepId],
    content: { text: 'C' },
  });

  store.add(compA).add(compB).add(compC);

  // A -> B
  const connAB = ComponentFactory.createConnector({
    fromComponentId: compA.id,
    toComponentId: compB.id,
    stepIds: [stepId],
  });

  // B -> C
  const connBC = ComponentFactory.createConnector({
    fromComponentId: compB.id,
    toComponentId: compC.id,
    stepIds: [stepId],
  });

  store.add(connAB).add(connBC);

  // Tenter de créer C -> A (créerait un cycle)
  const connCA = ComponentFactory.createConnector({
    fromComponentId: compC.id,
    toComponentId: compA.id,
    stepIds: [stepId],
  });

  const rule = ConnectorValidationRules.getRule(stepId);
  if (rule) {
    const existingConnectors = store.getAll()
      .filter(c => c.type === ComponentType.CONNECTOR) as ConnectorComponent[];

    const validation = connCA.validateInContext(
      rule,
      compC,
      compA,
      existingConnectors
    );

    if (!validation.valid) {
      console.log(`✗ Cycle détecté : ${validation.error}`);
    } else {
      store.add(connCA);
      console.log('✓ Connexion ajoutée');
    }
  }

  return { store, connectors: [connAB, connBC, connCA] };
}

/**
 * Exemple 8 : Différents styles de flèches
 */
export function exampleArrowStyles() {
  const store = new ComponentStore();

  const comp1 = ComponentFactory.createProcess({
    position: { x: 100, y: 100, width: 100, height: 80 },
  });

  const comp2 = ComponentFactory.createProcess({
    position: { x: 300, y: 100, width: 100, height: 80 },
  });

  store.add(comp1).add(comp2);

  // Différents styles
  const styles = [
    { style: ArrowStyle.SOLID, endType: ArrowEndType.ARROW },
    { style: ArrowStyle.DASHED, endType: ArrowEndType.TRIANGLE },
    { style: ArrowStyle.DOTTED, endType: ArrowEndType.CIRCLE },
    { style: ArrowStyle.DOUBLE, endType: ArrowEndType.DIAMOND },
  ];

  const connectors = styles.map((config, index) => {
    const connector = ComponentFactory.createConnector({
      fromComponentId: comp1.id,
      toComponentId: comp2.id,
      arrowStyle: config.style,
      direction: ArrowDirection.RIGHT,
    });

    connector.setEndTypes(ArrowEndType.NONE, config.endType);

    return connector;
  });

  connectors.forEach(c => store.add(c));

  return { store, connectors };
}
