# Structure du Projet - Model to Deps

## 📁 Arborescence complète

```
model-to-deps/
├── package.json                    # Dépendances et scripts
├── tsconfig.json                   # Configuration TypeScript
├── MIGRATION.md                    # Guide de migration
│
├── electron/                       # Process principal Electron
│   ├── main.ts                     # Point d'entrée Electron
│   └── preload.ts                  # Script de préchargement
│
└── src/
    ├── domain/                     # Logique métier
    │   ├── components/             # 🆕 Nouveau système de composants
    │   │   ├── component-types.ts          # Types & interfaces
    │   │   ├── base-component.ts           # Classe abstraite de base
    │   │   ├── process-component.ts        # Composant Processus
    │   │   ├── decision-component.ts       # Composant Décision
    │   │   ├── start-end-component.ts      # Composant Début/Fin
    │   │   ├── data-component.ts           # Composant Données
    │   │   ├── custom-component.ts         # Composant personnalisé
    │   │   ├── component-factory.ts        # Factory pattern
    │   │   ├── component-store.ts          # Store avec CRUD
    │   │   ├── examples.ts                 # Exemples d'utilisation
    │   │   ├── index.ts                    # Point d'entrée
    │   │   └── README.md                   # Documentation
    │   │
    │   ├── diagram-stores.ts       # ⚠️ Ancien système (peut être supprimé)
    │   ├── diagram-types.ts        # ⚠️ Anciens types (peut être supprimé)
    │   ├── wizard-store.ts         # Store du wizard multi-étapes
    │   └── wizard-types.ts         # Types du wizard
    │
    └── renderer/                   # Interface utilisateur
        ├── index.html              # Page principale
        ├── main.ts                 # 🆕 Point d'entrée mis à jour
        ├── ui-controller.ts        # 🆕 Contrôleur UI mis à jour
        └── styles.css              # 🆕 Styles mis à jour
```

## 🎯 Fichiers clés

### Domain Layer (Logique métier)

| Fichier | Description | Statut |
|---------|-------------|--------|
| `components/` | Nouveau système de composants POO | ✅ Actif |
| `wizard-store.ts` | Gestion du wizard multi-étapes | ✅ Actif |
| `wizard-types.ts` | Types pour le wizard | ✅ Actif |
| `diagram-stores.ts` | Ancien système de diagrammes | ⚠️ Obsolète |
| `diagram-types.ts` | Anciens types de diagrammes | ⚠️ Obsolète |

### Renderer Layer (UI)

| Fichier | Description | Changements |
|---------|-------------|-------------|
| `main.ts` | Initialisation de l'app | ✅ Mis à jour avec exemples |
| `ui-controller.ts` | Contrôleur principal | ✅ Utilise ComponentStore |
| `styles.css` | Styles CSS | ✅ Nouveaux styles pour composants |
| `index.html` | Structure HTML | ✅ Inchangé |

## 🔄 Flux de données

```
┌─────────────────────────────────────────────────────────────┐
│                         ELECTRON                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    main.ts (Process Principal)         │  │
│  │  - Crée la fenêtre                                     │  │
│  │  - Charge index.html                                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                             ↓                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   RENDERER PROCESS                     │  │
│  │                                                         │  │
│  │  index.html → main.ts → UIController                   │  │
│  │                             ↓                           │  │
│  │                       WizardStore                       │  │
│  │                       ComponentStores (Map)             │  │
│  │                             ↓                           │  │
│  │              ┌──────────────┴──────────────┐           │  │
│  │              ↓                             ↓            │  │
│  │         step-1 Store              step-2 Store         │  │
│  │         step-3 Store                                   │  │
│  │              ↓                                          │  │
│  │         Components (BaseComponent)                     │  │
│  │         - ProcessComponent                             │  │
│  │         - DecisionComponent                            │  │
│  │         - StartEndComponent                            │  │
│  │         - DataComponent                                │  │
│  │         - CustomComponent                              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Hiérarchie des composants

```
BaseComponent (Classe abstraite)
├── ProcessComponent (Processus/Actions)
├── DecisionComponent (Points de décision)
├── StartEndComponent (Début/Fin de flux)
├── DataComponent (Données/Bases)
└── CustomComponent (Personnalisé)
```

Tous les composants héritent de :
- Propriétés de position (x, y, width, height, rotation)
- Propriétés de style (couleurs, bordures, ombres)
- Propriétés de contenu (texte, équations)
- Méthodes de manipulation (update, clone, validate)
- Sérialisation JSON

## 🔧 Scripts npm disponibles

```bash
# Développement
npm run dev              # Build + Watch + Electron

# Build
npm run build            # Compilation TypeScript
npm run copy-static      # Copie fichiers statiques

# Production
npm run start:electron   # Lance Electron uniquement

# Watch mode
npm run watch            # Compilation en mode watch
```

## 🎨 Architecture CSS

### Organisation des styles

```css
/* Layout principal */
.app-header          → En-tête avec wizard
.app-content         → Zone principale
.step-footer         → Pied de page avec contrôles

/* Wizard */
.wizard-steps-nav    → Navigation entre étapes
.wizard-step-button  → Bouton d'étape
.wizard-step.active  → Étape active

/* Contenu étape */
.step-content-wrapper → Container
.step-sidebar        → Barre latérale (composants)
.canvas-container    → Zone de dessin
.canvas              → Canvas proprement dit

/* Composants */
.diagram-component           → Base composant
.component-{type}            → Type (process, decision, etc.)
.shape-{shape}               → Forme (diamond, ellipse, etc.)
.component-label             → Label
.component-equation          → Équation LaTeX
```

## 💾 Stockage des données

### LocalStorage

Chaque étape sauvegarde ses composants :
- Clé : `components-{stepId}`
- Format : JSON (SerializedComponent[])
- Auto-save : lors du déplacement

### Export JSON

Structure d'export :
```json
{
  "wizard": {
    "currentStep": 0,
    "totalSteps": 3
  },
  "steps": {
    "step-1": {
      "count": 3,
      "stats": { "total": 3, "process": 2, "data": 1 },
      "components": [...]
    }
  }
}
```

## 🚀 Démarrage rapide

1. **Installation**
   ```bash
   npm install
   ```

2. **Développement**
   ```bash
   npm run dev
   ```

3. **Utilisation**
   - Glissez-déposez des composants de la sidebar
   - Double-cliquez pour éditer
   - Naviguez entre les étapes
   - Exportez en JSON

4. **Debug**
   - Console → `app.exportAll()` pour voir les données
   - DevTools Electron : View → Toggle Developer Tools

## 📚 Documentation supplémentaire

- [MIGRATION.md](MIGRATION.md) - Guide de migration et nouveautés
- [src/domain/components/README.md](src/domain/components/README.md) - Doc complète des composants
- [src/domain/components/examples.ts](src/domain/components/examples.ts) - Exemples de code

## 🎯 TODO / Améliorations futures

- [ ] Suppression des anciens fichiers diagram-*.ts
- [ ] Système de connexions entre composants (edges/arrows)
- [ ] Undo/Redo
- [ ] Export SVG/PNG
- [ ] Templates de diagrammes
- [ ] Zoom & Pan du canvas
- [ ] Grille magnétique
- [ ] Tests unitaires
- [ ] i18n (internationalisation)
