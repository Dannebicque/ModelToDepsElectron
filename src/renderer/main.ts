import { UIController } from './ui-controller';
import { WizardConfig } from '../domain/wizard-types';
import { ComponentFactory, ComponentType, ConnectorValidationRules } from '../domain/components';

// ========================================
// CONFIGURATION DES RÈGLES DE VALIDATION DES CONNECTEURS
// ========================================

// Règles pour step-1 : Vue physique
ConnectorValidationRules.registerRule('step-1', {
  stepId: 'step-1',
  allowedFromTypes: [ComponentType.DATA, ComponentType.PROCESS, ComponentType.CUSTOM],
  allowedToTypes: [ComponentType.DATA, ComponentType.PROCESS, ComponentType.CUSTOM],
  maxConnectionsFrom: 10,
  maxConnectionsTo: 10,
  customValidator: (connector, context) => {
    // Règles spécifiques pour les capteurs et machines
    const { fromComponent, toComponent } = context;
    
    // Un capteur ne peut se connecter qu'à une machine
    if (fromComponent.content.text?.includes('Capteur') && 
        !toComponent.content.text?.includes('Machine')) {
      return {
        valid: false,
        error: 'Un capteur ne peut se connecter qu\'à une machine',
      };
    }
    
    return { valid: true };
  },
});

// Règles pour step-2 : Vue Observateur
ConnectorValidationRules.registerRule('step-2', {
  stepId: 'step-2',
  allowedFromTypes: [ComponentType.DATA, ComponentType.PROCESS, ComponentType.DECISION],
  allowedToTypes: [ComponentType.DATA, ComponentType.PROCESS, ComponentType.DECISION],
  maxConnectionsFrom: 5,
});

// Règles pour les autres steps (permissif par défaut)
['step-3', 'step-4', 'step-5', 'step-6', 'step-7', 'step-8'].forEach(stepId => {
  ConnectorValidationRules.registerRule(stepId, {
    stepId,
    maxConnectionsFrom: 10,
    maxConnectionsTo: 10,
  });
});

// ========================================
// CONFIGURATION DU WIZARD AVEC LES NOUVEAUX COMPOSANTS
// ========================================

const config: WizardConfig = {
  maxSteps: 8,
  steps: [
    {
      id: 'step-1',
      title: 'Vue physique',
      description: 'Définissez les capteurs de votre modèle physique',
      order: 1,
      components: [
        {
          id: 'capteur-boolean',
          name: 'Capteur Booléen',
          description: 'Capteur avec deux états (vrai/faux)',
          category: 'capteur-boolean',
        },
        {
          id: 'capteur-numeric',
          name: 'Capteur Numérique',
          description: 'Capteur avec valeurs numériques (entiers)',
          category: 'capteur-numeric',
        },
        {
          id: 'machine',
          name: 'Machine',
          description: 'Composant machine physique',
          category: 'machine',
        },
        {
          id: 'link',
          name: 'Lien',
          description: 'Lien d\'appartenance entre un capteur et une machine',
          category: 'connector',
        },
      ],
    },
    {
      id: 'step-2',
      title: 'Vue Observateur de capteurs',
      description: 'Configurez votre infrastructure de données',
      order: 2,
      components: [
        {
          id: 'sql-data',
          name: 'SQL Database',
          description: 'Base relationnelle',
          category: 'data',
        },
        {
          id: 'nosql-data',
          name: 'NoSQL Database',
          description: 'Base non-relationnelle',
          category: 'data',
        },
        {
          id: 'cache-data',
          name: 'Cache',
          description: 'Redis/Memcached',
          category: 'data',
        },
        {
          id: 'validation-decision',
          name: 'Validation',
          description: 'Point de décision pour la validation',
          category: 'decision',
        },
      ],
    },
    {
      id: 'step-3',
      title: 'Vue tâches',
      description: 'Ajoutez vos services et microservices',
      order: 3,
      components: [
        {
          id: 'auth-service',
          name: 'Authentification',
          description: "Service d'authentification",
          category: 'process',
        },
        {
          id: 'gateway-service',
          name: 'API Gateway',
          description: "Point d'entrée",
          category: 'process',
        },
        {
          id: 'queue-service',
          name: 'Message Queue',
          description: 'File de messages',
          category: 'data',
        },
        {
          id: 'end',
          name: 'Fin du processus',
          description: 'Point de fin du workflow',
          category: 'flow',
        },
      ],
    },
    {
      id: 'step-4',
      title: 'Vue intra-tâches',
      description: 'Ajoutez vos services et microservices',
      order: 4,
      components: [
        {
          id: 'auth-service',
          name: 'Authentification',
          description: "Service d'authentification",
          category: 'process',
        },
        {
          id: 'gateway-service',
          name: 'API Gateway',
          description: "Point d'entrée",
          category: 'process',
        },
        {
          id: 'queue-service',
          name: 'Message Queue',
          description: 'File de messages',
          category: 'data',
        },
        {
          id: 'end',
          name: 'Fin du processus',
          description: 'Point de fin du workflow',
          category: 'flow',
        },
      ],
    },
    {
      id: 'step-5',
      title: 'Vue incompatibilités',
      description: 'Ajoutez vos services et microservices',
      order: 5,
      components: [
        {
          id: 'auth-service',
          name: 'Authentification',
          description: "Service d'authentification",
          category: 'process',
        },
        {
          id: 'gateway-service',
          name: 'API Gateway',
          description: "Point d'entrée",
          category: 'process',
        },
        {
          id: 'queue-service',
          name: 'Message Queue',
          description: 'File de messages',
          category: 'data',
        },
        {
          id: 'end',
          name: 'Fin du processus',
          description: 'Point de fin du workflow',
          category: 'flow',
        },
      ],
    },
    {
      id: 'step-6',
      title: 'Vue successions',
      description: 'Ajoutez vos services et microservices',
      order: 6,
      components: [
        {
          id: 'auth-service',
          name: 'Authentification',
          description: "Service d'authentification",
          category: 'process',
        },
        {
          id: 'gateway-service',
          name: 'API Gateway',
          description: "Point d'entrée",
          category: 'process',
        },
        {
          id: 'queue-service',
          name: 'Message Queue',
          description: 'File de messages',
          category: 'data',
        },
        {
          id: 'end',
          name: 'Fin du processus',
          description: 'Point de fin du workflow',
          category: 'flow',
        },
      ],
    },
    {
      id: 'step-7',
      title: 'Vue priorités',
      description: 'Ajoutez vos services et microservices',
      order: 7,
      components: [
        {
          id: 'auth-service',
          name: 'Authentification',
          description: "Service d'authentification",
          category: 'process',
        },
        {
          id: 'gateway-service',
          name: 'API Gateway',
          description: "Point d'entrée",
          category: 'process',
        },
        {
          id: 'queue-service',
          name: 'Message Queue',
          description: 'File de messages',
          category: 'data',
        },
        {
          id: 'end',
          name: 'Fin du processus',
          description: 'Point de fin du workflow',
          category: 'flow',
        },
      ],
    },
    {
      id: 'step-8',
      title: 'Vue globale',
      description: 'Ajoutez vos services et microservices',
      order: 8,
      components: [
        {
          id: 'auth-service',
          name: 'Authentification',
          description: "Service d'authentification",
          category: 'process',
        },
        {
          id: 'gateway-service',
          name: 'API Gateway',
          description: "Point d'entrée",
          category: 'process',
        },
        {
          id: 'queue-service',
          name: 'Message Queue',
          description: 'File de messages',
          category: 'data',
        },
        {
          id: 'end',
          name: 'Fin du processus',
          description: 'Point de fin du workflow',
          category: 'flow',
        },
      ],
    },
  ],
};

// ========================================
// INITIALISATION DE L'APPLICATION
// ========================================

class App {
  private uiController: UIController;

  constructor() {
    console.log('Application initializing...');
    this.uiController = new UIController(config);
    console.log('Application ready!');
  }

  /**
   * Exporter tous les composants en JSON
   */
  public exportAll(): string {
    const componentStores = (this.uiController as any).componentStores as Map<string, any>;
    const exportData: Record<string, any> = {};

    componentStores.forEach((store, stepId) => {
      exportData[stepId] = {
        count: store.count,
        stats: store.getStats(),
        components: store.toJSON(),
      };
    });

    return JSON.stringify(exportData, null, 2);
  }
}

// Initialiser l'application quand le DOM est prêt
const app = new App();

// Exposer l'app globalement pour le debugging
(window as any).app = app;

console.log('main.ts loaded');
console.log('Pour exporter les composants: app.exportAll()');
