import { UIController } from './ui-controller';
import { WizardConfig } from '../domain/wizard-types';
import { ComponentFactory, ComponentType } from '../domain/components';

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
          category: 'link',
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
