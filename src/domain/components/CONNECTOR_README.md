# ConnectorComponent - Système de Liens entre Composants

## Vue d'ensemble

Le système `ConnectorComponent` permet de créer et gérer des liens (flèches) entre les composants d'un diagramme. Il offre une validation contextuelle selon l'étape (step) du wizard et supporte différents styles de flèches.

## Caractéristiques principales

- ✅ **Composant de départ et d'arrivée** : Chaque connecteur lie deux composants
- ✅ **Direction graphique** : Orientation de la flèche (droite, gauche, haut, bas, diagonales)
- ✅ **Styles variés** : Flèches solides, pointillées, doubles, etc.
- ✅ **Validation contextuelle** : Règles de validation spécifiques par étape (step)
- ✅ **Labels** : Étiquettes sur les flèches (ex: "Oui", "Non")
- ✅ **Bidirectionnel** : Support des connexions dans les deux sens
- ✅ **Points de contrôle** : Création de courbes avec points de passage
- ✅ **Détection de cycles** : Validation pour graphes acycliques (DAG)

## Utilisation de base

### Créer un connecteur simple

```typescript
import { ComponentFactory } from './component-factory';

// Créer deux composants
const startComponent = ComponentFactory.createStart({
  position: { x: 100, y: 100, width: 100, height: 50 },
  content: { text: 'Début' },
});

const processComponent = ComponentFactory.createProcess({
  position: { x: 300, y: 100, width: 150, height: 80 },
  content: { text: 'Traitement' },
});

// Créer un connecteur
const connector = ComponentFactory.createConnector({
  fromComponentId: startComponent.id,
  toComponentId: processComponent.id,
  direction: ArrowDirection.RIGHT,
  arrowStyle: ArrowStyle.SOLID,
  endEndType: ArrowEndType.ARROW,
});
```

### Direction automatique

```typescript
const connector = ComponentFactory.createConnector({
  fromComponentId: comp1.id,
  toComponentId: comp2.id,
});

// Calculer automatiquement la direction selon les positions
const autoDirection = connector.calculateAutoDirection(comp1, comp2);
connector.setDirection(autoDirection);
```

### Ajouter un label

```typescript
const connector = ComponentFactory.createConnector({
  fromComponentId: decision.id,
  toComponentId: processYes.id,
});

connector.setLabel('Oui', 0.5); // Label au milieu (0.5)
```

## Types de flèches

### ArrowDirection

```typescript
enum ArrowDirection {
  RIGHT = 'right',           // →
  LEFT = 'left',             // ←
  DOWN = 'down',             // ↓
  UP = 'up',                 // ↑
  DIAGONAL_DR = 'diagonal-dr', // ↘
  DIAGONAL_DL = 'diagonal-dl', // ↙
  DIAGONAL_UR = 'diagonal-ur', // ↗
  DIAGONAL_UL = 'diagonal-ul', // ↖
}
```

### ArrowStyle

```typescript
enum ArrowStyle {
  SOLID = 'solid',       // ━━━►
  DASHED = 'dashed',     // ╌╌╌►
  DOTTED = 'dotted',     // ┄┄┄►
  DOUBLE = 'double',     // ═══►
}
```

### ArrowEndType

```typescript
enum ArrowEndType {
  ARROW = 'arrow',       // >
  TRIANGLE = 'triangle', // ▶
  CIRCLE = 'circle',     // ●
  DIAMOND = 'diamond',   // ◆
  NONE = 'none',        // (pas de terminaison)
}
```

## Validation contextuelle

### Définir des règles par step

```typescript
import { ConnectorValidationRules, ComponentType } from './components';

ConnectorValidationRules.registerRule('flowchart-step', {
  stepId: 'flowchart-step',
  
  // Types autorisés
  allowedFromTypes: [
    ComponentType.START_END,
    ComponentType.PROCESS,
    ComponentType.DECISION,
  ],
  allowedToTypes: [
    ComponentType.PROCESS,
    ComponentType.DECISION,
    ComponentType.START_END,
  ],
  
  // Limites de connexions
  maxConnectionsFrom: 10,
  maxConnectionsTo: 10,
  
  // Paires interdites
  forbiddenPairs: [
    { from: ComponentType.START_END, to: ComponentType.START_END },
  ],
});
```

### Valider un connecteur

```typescript
const rule = ConnectorValidationRules.getRule('flowchart-step');
const existingConnectors = store.getAll()
  .filter(c => c.type === ComponentType.CONNECTOR);

const validation = connector.validateInContext(
  rule,
  fromComponent,
  toComponent,
  existingConnectors
);

if (!validation.valid) {
  console.error(validation.error);
}
```

### Règles prédéfinies

```typescript
import { PRESET_VALIDATION_RULES } from './components';

// Aucune restriction
ConnectorValidationRules.registerRule(
  'my-step',
  PRESET_VALIDATION_RULES.PERMISSIVE
);

// Graphe acyclique (DAG)
ConnectorValidationRules.registerRule(
  'my-step',
  PRESET_VALIDATION_RULES.DAG
);

// Structure d'arbre stricte
ConnectorValidationRules.registerRule(
  'my-step',
  PRESET_VALIDATION_RULES.TREE_STRICT
);

// Séquentiel (une entrée, une sortie)
ConnectorValidationRules.registerRule(
  'my-step',
  PRESET_VALIDATION_RULES.SEQUENTIAL
);
```

### Validation personnalisée

```typescript
ConnectorValidationRules.registerRule('custom-step', {
  stepId: 'custom-step',
  customValidator: (connector, context) => {
    const { fromComponent, toComponent, existingConnectors } = context;
    
    // Votre logique personnalisée
    if (fromComponent.type === ComponentType.DATA && 
        toComponent.type === ComponentType.DATA) {
      return {
        valid: false,
        error: 'Un DATA ne peut pas se connecter à un autre DATA',
      };
    }
    
    return { valid: true };
  },
});
```

## Fonctionnalités avancées

### Connecteur bidirectionnel

```typescript
const connector = ComponentFactory.createConnector({
  fromComponentId: serverA.id,
  toComponentId: serverB.id,
});

connector.setBidirectional(true);
connector.setEndTypes(ArrowEndType.ARROW, ArrowEndType.ARROW);
connector.setLabel('Communication', 0.5);
```

### Courbes avec points de contrôle

```typescript
const connector = ComponentFactory.createConnector({
  fromComponentId: comp1.id,
  toComponentId: comp2.id,
});

// Définir une courbe avec des points de passage
connector.setControlPoints([
  { x: 200, y: 150 },
  { x: 250, y: 200 },
  { x: 200, y: 250 },
]);
```

### Détection de cycles (DAG)

```typescript
ConnectorValidationRules.registerRule('dag-step', PRESET_VALIDATION_RULES.DAG);

// La validation refusera toute connexion créant un cycle
const validation = connector.validateInContext(rule, compC, compA, existingConnectors);
// Si A→B→C existe déjà, C→A sera refusé
```

## Exemples complets

Consultez [connector-examples.ts](./connector-examples.ts) pour des exemples détaillés :

- ✓ Connecteur simple
- ✓ Direction automatique
- ✓ Connecteur avec label
- ✓ Validation contextuelle
- ✓ Connecteur bidirectionnel
- ✓ Courbes
- ✓ Validation DAG
- ✓ Différents styles de flèches

## API Principale

### ConnectorComponent

#### Propriétés

```typescript
connector.fromComponentId   // ID du composant source
connector.toComponentId     // ID du composant destination
connector.direction         // Direction de la flèche
connector.arrowStyle        // Style de la ligne
connector.startEndType      // Type de terminaison au départ
connector.endEndType        // Type de terminaison à l'arrivée
connector.controlPoints     // Points de contrôle pour courbes
connector.label             // Étiquette sur la flèche
connector.labelPosition     // Position du label (0-1)
connector.isBidirectional   // Flèche bidirectionnelle
```

#### Méthodes

```typescript
connector.setFromComponent(id)
connector.setToComponent(id)
connector.setDirection(direction)
connector.setArrowStyle(style)
connector.setEndTypes(startType, endType)
connector.setControlPoints(points)
connector.setLabel(text, position)
connector.setBidirectional(boolean)
connector.calculateAutoDirection(fromComp, toComp)
connector.validate()
connector.validateInContext(rule, fromComp, toComp, existing)
connector.clone()
```

## Intégration dans votre projet

Le système de connecteurs s'intègre naturellement avec l'architecture existante :

1. **ComponentStore** : Gère les connecteurs comme tout autre composant
2. **ComponentFactory** : `createConnector()` pour créer des instances
3. **Validation** : Intégration avec le système de validation des steps
4. **Sérialisation** : Support JSON pour persistance

```typescript
const store = new ComponentStore();

// Ajouter des composants
store.add(startComponent);
store.add(processComponent);

// Ajouter un connecteur
const connector = ComponentFactory.createConnector({
  fromComponentId: startComponent.id,
  toComponentId: processComponent.id,
});

store.add(connector);

// Récupérer tous les connecteurs
const connectors = store.getAll()
  .filter(c => c.type === ComponentType.CONNECTOR);
```

## Notes importantes

⚠️ **Validation obligatoire** : Appelez toujours `validate()` avant d'ajouter un connecteur au store

⚠️ **IDs valides** : Les `fromComponentId` et `toComponentId` doivent correspondre à des composants existants

⚠️ **Pas de self-loops** : Un composant ne peut pas se connecter à lui-même

⚠️ **Règles par step** : N'oubliez pas de définir les règles de validation pour chaque step où les connecteurs sont utilisés

## Support

Pour toute question ou suggestion, consultez la documentation principale du projet ou les exemples fournis.
