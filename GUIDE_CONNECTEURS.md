# Guide d'utilisation - Créer des liens entre composants

## 🎯 Comment créer un lien (connecteur)

### Méthode simple : Clic dans la liste

1. **Cliquez sur "Lien"** dans la liste des composants (sidebar gauche)
   - Le composant "Lien" devient **actif** avec un fond violet animé
   - Un message apparaît : "Cliquez sur le composant de départ"
   - Le curseur du canvas devient une croix

2. **Cliquez sur le composant de DÉPART** dans le canvas
   - Le composant source est surligné en bleu avec une animation
   - Message : "Cliquez sur le composant de destination"
   - Une ligne pointillée suit votre souris

3. **Cliquez sur le composant de DESTINATION** dans le canvas
   - Le connecteur est automatiquement créé avec une flèche
   - La direction est calculée automatiquement
   - Message de confirmation : "Connecteur créé avec succès"
   - Le mode se désactive automatiquement

### Désactivation manuelle

- **Cliquez à nouveau sur "Lien"** dans la liste pour annuler le mode
- **Touche Escape** : Annule également la création en cours
- Le composant "Lien" redevient normal (sans animation)

## 💡 Avantages de cette méthode

✅ **Pas de drag & drop** : Simple clic pour activer
✅ **Feedback visuel clair** : Le composant "Lien" s'anime quand actif
✅ **Toggle on/off** : Cliquez pour activer, recliquez pour désactiver
✅ **Guidage étape par étape** : Messages contextuels

## ⚙️ Règles de validation

### Step 1 - Vue physique

Dans cette étape, les règles suivantes s'appliquent :

✅ **Autorisé** :
- Un capteur peut se connecter à une machine
- Une machine peut se connecter à un capteur
- Maximum 10 connexions par composant

❌ **Interdit** :
- Un capteur ne peut PAS se connecter à un autre capteur
- Un capteur ne peut PAS se connecter directement à autre chose qu'une machine
- Un composant ne peut PAS se connecter à lui-même

### Step 2 - Vue Observateur

✅ **Autorisé** :
- Connexions entre bases de données
- Connexions entre processus
- Points de décision
- Maximum 5 connexions sortantes par composant

### Autres steps

Règles permissives : Maximum 10 connexions par composant

## 🎨 Caractéristiques des connecteurs

### Création automatique

- **Direction** : Calculée automatiquement selon les positions
- **Style** : Ligne pleine avec flèche
- **Couleur** : Bleu (#2c5aa0)

### Interactions

- **Clic** : Sélectionne le connecteur
- **Clic droit** : Menu contextuel (éditer, supprimer)
- **Survol** : La ligne s'épaissit

### Affichage

- Les connecteurs sont dessinés en SVG
- Ils passent sous les composants (z-index: 1)
- Labels affichés au centre de la flèche

## 🔍 Messages d'erreur

### "Impossible de connecter un composant à lui-même"
➡️ Vous avez cliqué deux fois sur le même composant. Choisissez deux composants différents.

### "Un capteur ne peut se connecter qu'à une machine"
➡️ Dans Step 1, respectez la règle : Capteur → Machine uniquement.

### "Connexion invalide"
➡️ La connexion viole une règle de validation du step actuel.

### "Le type X n'est pas autorisé comme source"
➡️ Le type de composant source n'est pas permis dans cette étape.

## 💡 Astuces

1. **Ligne temporaire** : Pendant la création, une ligne pointillée suit votre souris pour prévisualiser la connexion

2. **Surbrillance** : Le composant source est surligné en bleu pulsant pour vous rappeler votre sélection

3. **Validation immédiate** : Si une connexion est invalide, vous êtes informé immédiatement avec un message explicatif

4. **Annulation rapide** : Pressez Escape à tout moment pour annuler

## 🎬 Exemple complet

### Scénario : Connecter un capteur à une machine (Step 1)

```text
1. Cliquez sur "Lien" dans la liste
   → Le composant "Lien" s'anime en violet
   → Message : "Cliquez sur le composant de départ"
   → Curseur devient une croix

2. Cliquez sur "Capteur Booléen" dans le canvas
   → Le capteur est surligné en bleu
   → Message : "Cliquez sur le composant de destination"
   → Une ligne pointillée suit votre souris

3. Cliquez sur "Machine" dans le canvas
   → La flèche est créée du capteur vers la machine
   → Message : "Connecteur créé avec succès"
   → Le composant "Lien" redevient normal
   → Mode désactivé automatiquement
```

### Pour créer plusieurs liens d'affilée

```text
1. Cliquez sur "Lien" → Mode activé
2. Créez votre premier lien (source → destination)
   → Le lien est créé
   → Mode désactivé automatiquement

3. Cliquez à nouveau sur "Lien" → Mode réactivé
4. Créez votre deuxième lien
   → etc.
```

## 🛠️ Prochaines améliorations possibles

- [ ] Édition du label des connecteurs
- [ ] Changement du style de flèche (pointillé, double, etc.)
- [ ] Courbes avec points de contrôle
- [ ] Connexions bidirectionnelles
- [ ] Couleurs personnalisées

---

**Note** : Les connecteurs sont automatiquement sauvegardés dans le store du step actuel et persisteront lors de la navigation entre les étapes.
