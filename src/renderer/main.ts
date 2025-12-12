import { UIController } from './ui-controller';
import { WizardConfig } from '../domain/wizard-types';
import { ComponentFactory, ComponentType } from '../domain/components';

// ========================================
// CONFIGURATION DU WIZARD AVEC LES NOUVEAUX COMPOSANTS
// ========================================

const config: WizardConfig = {
  maxSteps: 3,
  steps: [
    {
      id: 'step-1',
      title: 'Architecture Générale',
      description: 'Définissez les composants principaux de votre système',
      order: 1,
      components: [
        {
          id: 'start',
          name: 'Début du processus',
          description: 'Point de départ du workflow',
          category: 'flow',
        },
        {
          id: 'db-process',
          name: 'Base de données',
          description: 'Composant de stockage de données',
          category: 'data',
        },
        {
          id: 'api-process',
          name: 'API',
          description: 'Interface de programmation',
          category: 'process',
        },
        {
          id: 'ui-process',
          name: 'Interface Web',
          description: 'Frontend utilisateur',
          category: 'process',
        },
      ],
    },
    {
      id: 'step-2',
      title: 'Couche Données',
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
      title: 'Services Backend',
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
