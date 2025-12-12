/**
 * Types pour le système de wizard/onglets
 */

export interface Component {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

export interface StepValidationRule {
  rule: (stepData: StepData) => boolean;
  message: string;
}

export interface StepData {
  stepId: string;
  diagramNodes: any[];
  diagramEdges: any[];
  selectedComponents: Component[];
  customData?: Record<string, any>;
}

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  order: number;
  components: Component[];
  validationRules?: StepValidationRule[];
}

export interface WizardConfig {
  steps: WizardStep[];
  maxSteps: number;
}

export interface WizardState {
  currentStep: number;
  stepsData: Map<string, StepData>;
  isValid: Map<number, boolean>;
}
