# Architecture des Composants

## Vue d'ensemble

Cette architecture fournit un système robuste et extensible pour gérer différents types de composants graphiques dans votre application. Elle est inspirée des principes de la POO (classes abstraites, héritage, polymorphisme) tout en tirant parti des fonctionnalités TypeScript.

## Structure

```
src/domain/components/
├── component-types.ts      # Types, interfaces et énumérations
├── base-component.ts       # Classe abstraite de base
├── concrete-components.ts  # Implémentations concrètes
├── component-factory.ts    # Factory pour créer des composants
├── component-store.ts      # Store pour gérer la collection
├── examples.ts            # Exemples d'utilisation
└── index.ts               # Point d'entrée du module
```

## Principes de conception

### 1. Classes Abstraites (comme en PHP)

La classe `BaseComponent` est abstraite et définit le comportement commun :
- Propriétés de base (id, type, shape, position, style, content)
- Méthodes de manipulation (update, clone, validate)
- Sérialisation/désérialisation JSON

### 2. Héritage et Spécialisation

Chaque type de composant hérite de `BaseComponent` :
- `ProcessComponent` : Processus/actions
- `DecisionComponent` : Points de décision
- `StartEndComponent` : Début/fin de flux
- `DataComponent` : Données/bases de données
- `CustomComponent` : Composants personnalisés

### 3. Types Discriminés (Union Types)

TypeScript permet de créer des types union avec discrimination :
```typescript
type ComponentData =
  | ProcessComponentData
  | DecisionComponentData
  | StartEndComponentData
  | DataComponentData
  | CustomComponentData;
```

### 4. Factory Pattern

Le `ComponentFactory` centralise la création des composants :
- Garantit la cohérence
- Simplifie la création
- Facilite la désérialisation

## Caractéristiques

### Propriétés Communes

Tous les composants partagent :

**Position** :
- x, y : coordonnées
- width, height : dimensions
- rotation : angle (optionnel)

**Style** :
- fillColor, strokeColor : couleurs
- strokeWidth : épaisseur de bordure
- borderStyle : simple, double, pointillé, etc.
- opacity, shadow : effets visuels

**Contenu** :
- text : texte affiché
- equation : formule LaTeX (optionnel)
- fontSize, fontFamily : typographie
- textColor, textAlign : style de texte

**Métadonnées** :
- stepIds : étapes où le composant apparaît
- metadata : propriétés personnalisées
- createdAt, updatedAt : horodatage

### Propriétés Spécifiques

Chaque type peut avoir des propriétés additionnelles :

**ProcessComponent** :
- processName : nom du processus
- description : description détaillée

**DecisionComponent** :
- question : question posée
- conditions : liste des conditions (oui/non, etc.)

**StartEndComponent** :
- isStart : true pour début, false pour fin

**DataComponent** :
- dataType : type de données
- fields : champs structurés

**CustomComponent** :
- customProperties : propriétés libres

## Utilisation

### Création de base

```typescript
import { ComponentFactory, ComponentType } from './components';

// Création simple
const process = ComponentFactory.create(ComponentType.PROCESS, {
  content: { text: 'Mon processus' },
  position: { x: 100, y: 100, width: 200, height: 80 }
});

// Création rapide
const decision = ComponentFactory.createDecision({
  content: { text: 'Condition?' }
});
```

### Modification

```typescript
// Modifier la position
process.updatePosition({ x: 150, y: 120 });

// Modifier le style
process.updateStyle({ fillColor: '#ff0000' });

// Modifier le contenu
process.updateContent({ text: 'Nouveau texte' });

// Méthodes spécifiques
process.setProcessName('Traitement des données');
```

### Gestion avec le Store

```typescript
import { ComponentStore } from './components';

const store = new ComponentStore();

// Ajouter
store.add(process);

// Récupérer
const component = store.get(id);
const all = store.getAll();
const processes = store.getByType(ComponentType.PROCESS);
const step1 = store.getByStep('step-1');

// Filtrer
const results = store.filter({
  type: ComponentType.PROCESS,
  stepId: 'step-2',
  search: 'traitement'
});

// Mettre à jour
store.update(id, (comp) => {
  comp.updatePosition({ x: 200, y: 200 });
});

// Cloner
const clone = store.clone(id);
```

### Sauvegarde et Chargement

```typescript
// Sauvegarder dans localStorage
store.save('my-components');

// Charger depuis localStorage
store.load('my-components');

// Exporter en JSON
const json = store.export();

// Importer depuis JSON
store.import(jsonString);

// Sérialiser pour API
const data = store.toJSON();
```

## Extensibilité

### Ajouter un nouveau type de composant

1. **Définir les types** dans `component-types.ts` :
```typescript
export enum ComponentType {
  // ... types existants
  MY_NEW_TYPE = 'my-new-type',
}

export interface MyNewComponentData extends BaseComponentData {
  type: ComponentType.MY_NEW_TYPE;
  myCustomProperty?: string;
}

export type ComponentData =
  | ProcessComponentData
  | DecisionComponentData
  // ... autres types
  | MyNewComponentData;
```

2. **Créer la classe** dans `concrete-components.ts` :
```typescript
export class MyNewComponent extends BaseComponent<MyNewComponentData> {
  protected getDefaultType(): ComponentType {
    return ComponentType.MY_NEW_TYPE;
  }

  protected getDefaultShape(): ShapeType {
    return ShapeType.RECTANGLE;
  }

  protected getSpecificDefaults(partial: Partial<MyNewComponentData>) {
    return {
      myCustomProperty: partial.myCustomProperty ?? 'default',
    };
  }

  validate(): boolean {
    return this.validateBase();
  }

  // Méthodes spécifiques
  setCustomProperty(value: string): this {
    this.data.myCustomProperty = value;
    this.touch();
    return this;
  }
}
```

3. **Ajouter à la Factory** dans `component-factory.ts` :
```typescript
static create(type: ComponentType, data?: Partial<ComponentData>): BaseComponent {
  switch (type) {
    // ... cas existants
    case ComponentType.MY_NEW_TYPE:
      return new MyNewComponent(data as Partial<MyNewComponentData>);
  }
}

static createMyNew(data?: Partial<MyNewComponentData>): MyNewComponent {
  return new MyNewComponent(data ?? {});
}
```

4. **Exporter** dans `index.ts` :
```typescript
export { MyNewComponent } from './concrete-components';
```

## Traduction et Internationalisation

Pour gérer la traduction :

```typescript
// Stocker les clés de traduction au lieu du texte direct
const process = ComponentFactory.createProcess({
  content: { 
    text: 'process.initialize', // Clé de traduction
  },
  metadata: {
    i18nKey: 'process.initialize',
    i18nNamespace: 'diagrams'
  }
});

// Dans votre application, résoudre la traduction
function getTranslatedText(component: BaseComponent, locale: string): string {
  const key = component.metadata.i18nKey ?? component.content.text;
  return i18n.t(key, { locale });
}
```

## Bonnes Pratiques

1. **Toujours utiliser la Factory** pour créer des composants
2. **Valider avant d'ajouter** au store
3. **Utiliser les méthodes update** plutôt que de modifier directement les données
4. **Sauvegarder régulièrement** pour éviter la perte de données
5. **Cloner avant modification** si vous voulez garder l'original
6. **Utiliser les types discriminés** pour la sécurité de type
7. **Ajouter des métadonnées** pour des fonctionnalités personnalisées

## Migration depuis l'ancien système

Si vous avez l'ancien système avec `DiagramNode` :

```typescript
// Ancien
interface DiagramNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  // ...
}

// Nouveau
const component = ComponentFactory.create(ComponentType.PROCESS, {
  position: { x: node.x, y: node.y, width: node.width, height: node.height },
  content: { text: node.label },
  style: { fillColor: node.color }
});
```

## Tests

Pour tester vos composants :

```typescript
import { ComponentFactory, ComponentType } from './components';

describe('ProcessComponent', () => {
  it('should create with default values', () => {
    const process = ComponentFactory.createProcess();
    expect(process.type).toBe(ComponentType.PROCESS);
    expect(process.validate()).toBe(true);
  });

  it('should update position', () => {
    const process = ComponentFactory.createProcess();
    process.updatePosition({ x: 200, y: 200 });
    expect(process.position.x).toBe(200);
  });
});
```
