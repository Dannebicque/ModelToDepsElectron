# 🎉 Mise à jour de l'architecture - Nouveau système de composants

## ✅ Changements effectués

### 📁 **Structure réorganisée**

Les composants sont maintenant séparés en fichiers individuels pour une meilleure maintenabilité :

```
src/domain/components/
├── component-types.ts          # Types, interfaces, énumérations
├── base-component.ts           # Classe abstraite de base
├── process-component.ts        # Composant Processus
├── decision-component.ts       # Composant Décision
├── start-end-component.ts      # Composant Début/Fin
├── data-component.ts           # Composant Données
├── custom-component.ts         # Composant personnalisé
├── component-factory.ts        # Factory pattern
├── component-store.ts          # Store avec CRUD
├── examples.ts                 # Exemples d'utilisation
├── index.ts                    # Point d'entrée
└── README.md                   # Documentation détaillée
```

### 🔧 **Fichiers modifiés**

- ✅ [src/renderer/main.ts](src/renderer/main.ts) - Nouvelle configuration avec exemples
- ✅ [src/renderer/ui-controller.ts](src/renderer/ui-controller.ts) - Utilise ComponentStore au lieu de DiagramStore
- ✅ [src/renderer/styles.css](src/renderer/styles.css) - Styles pour les nouveaux composants

### 🎯 **Fonctionnalités ajoutées**

#### Types de composants disponibles

1. **ProcessComponent** - Processus/actions (rectangle bleu)
2. **DecisionComponent** - Décisions/conditions (losange orange)
3. **StartEndComponent** - Début/fin (ellipse verte/rouge)
4. **DataComponent** - Données/DB (rectangle violet)
5. **CustomComponent** - Composants personnalisés (gris)

#### Propriétés complètes

Chaque composant possède :

- **Forme géométrique** : rectangle, losange, ellipse, cercle, arrondi
- **Position** : x, y, width, height, rotation
- **Style** : couleurs, bordures (simple/double/pointillé), ombres
- **Contenu** : texte + équations LaTeX
- **Étapes multiples** : peut apparaître sur plusieurs étapes
- **Métadonnées** : propriétés personnalisées extensibles

#### Gestion robuste

- ✅ Validation type-safe TypeScript
- ✅ Sérialisation/désérialisation JSON
- ✅ Sauvegarde automatique dans localStorage
- ✅ Pattern Factory pour création cohérente
- ✅ Clonage de composants
- ✅ Filtrage et recherche
- ✅ Horodatage automatique (createdAt, updatedAt)

## 🚀 Utilisation

### Démarrer l'application

```bash
npm run dev
```

### Exemple de création de composants

```typescript
import { ComponentFactory, ComponentType } from './domain/components';

// Méthode 1 : Via la factory
const process = ComponentFactory.create(ComponentType.PROCESS, {
  content: { text: 'Mon processus' },
  position: { x: 100, y: 100, width: 200, height: 80 }
});

// Méthode 2 : Méthodes rapides
const decision = ComponentFactory.createDecision({
  question: 'Condition?',
  content: { text: 'Valider' }
});

const start = ComponentFactory.createStart({
  content: { text: 'Début' }
});
```

### Utilisation du Store

```typescript
import { ComponentStore } from './domain/components';

const store = new ComponentStore();

// Ajouter
store.add(process);
store.add(decision);

// Récupérer
const all = store.getAll();
const byType = store.getByType(ComponentType.PROCESS);
const byStep = store.getByStep('step-1');

// Sauvegarder
store.save('my-components');

// Charger
store.load('my-components');

// Exporter
const json = store.export();
```

## 📖 Documentation complète

Consultez [src/domain/components/README.md](src/domain/components/README.md) pour :

- Architecture détaillée
- Guide d'utilisation complet
- Comment ajouter de nouveaux types
- Gestion de la traduction
- Tests
- Bonnes pratiques

## 🎨 Interface utilisateur

L'application charge automatiquement des composants d'exemple à chaque étape :

- **Étape 1** : Architecture générale (Début, API, Base de données)
- **Étape 2** : Couche données (Validation, PostgreSQL, Redis)
- **Étape 3** : Services backend (Auth, Fin)

### Actions disponibles

- **Drag & Drop** : Glissez des composants de la sidebar vers le canvas
- **Déplacer** : Cliquez et glissez un composant
- **Sélectionner** : Clic simple sur un composant
- **Éditer** : Double-clic sur un composant
- **Exporter** : Bouton "Exporter JSON" pour sauvegarder tout

## 🔍 Débug et console

Dans la console développeur, vous avez accès à :

```javascript
// Exporter tous les composants
app.exportAll()

// Accéder au contrôleur UI
app.uiController

// Accéder aux stores
app.uiController.componentStores.get('step-1')
```

## 📦 Prochaines étapes

Suggestions d'améliorations :

1. **Système de connexions** : Ajouter des flèches/liens entre composants
2. **Undo/Redo** : Historique des actions
3. **Templates** : Modèles de diagrammes prédéfinis
4. **Export SVG/PNG** : Exportation graphique
5. **Collaboration** : Synchronisation multi-utilisateurs
6. **Zoom & Pan** : Navigation améliorée du canvas
7. **Grille magnétique** : Alignement automatique
8. **Groupes** : Regroupement de composants

## 💡 Support

Pour toute question ou amélioration, consultez la documentation dans `src/domain/components/` ou examinez les exemples dans `examples.ts`.

---

**Version** : 2.0.0  
**Date** : 12 décembre 2025  
**Auteur** : Adaptation TypeScript avec architecture POO
