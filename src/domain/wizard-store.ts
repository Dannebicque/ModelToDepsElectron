import { WizardConfig, WizardState, StepData, WizardStep } from './wizard-types';

export class WizardStore {
  private config: WizardConfig;
  private state: WizardState;

  constructor(config: WizardConfig) {
    this.config = config;
    this.state = {
      currentStep: 0,
      stepsData: new Map(),
      isValid: new Map(),
    };

    // Initialiser les données pour chaque step
    config.steps.forEach((step) => {
      this.state.stepsData.set(step.id, {
        stepId: step.id,
        diagramNodes: [],
        diagramEdges: [],
        selectedComponents: [],
        customData: {},
      });
      this.state.isValid.set(step.order, false);
    });
  }

  getConfig(): WizardConfig {
    return this.config;
  }

  getState(): WizardState {
    return this.state;
  }

  getCurrentStep(): WizardStep {
    return this.config.steps[this.state.currentStep];
  }

  getCurrentStepData(): StepData {
    const step = this.getCurrentStep();
    return this.state.stepsData.get(step.id)!;
  }

  canGoToStep(stepIndex: number): boolean {
    if (stepIndex < 0 || stepIndex >= this.config.steps.length) return false;
    if (stepIndex === 0) return true;
    // On ne peut aller à une étape que si toutes les précédentes sont valides
    for (let i = 0; i < stepIndex; i++) {
      if (!this.state.isValid.get(i)) return false;
    }
    return true;
  }

  goToStep(stepIndex: number): boolean {
    if (!this.canGoToStep(stepIndex)) return false;
    this.state.currentStep = stepIndex;
    return true;
  }

  goToNextStep(): boolean {
    return this.goToStep(this.state.currentStep + 1);
  }

  goToPreviousStep(): boolean {
    if (this.state.currentStep > 0) {
      this.state.currentStep -= 1;
      return true;
    }
    return false;
  }

  updateStepData(stepId: string, data: Partial<StepData>): void {
    const existing = this.state.stepsData.get(stepId);
    if (existing) {
      this.state.stepsData.set(stepId, { ...existing, ...data });
    }
  }

  validateCurrentStep(): boolean {
    const step = this.getCurrentStep();
    const data = this.getCurrentStepData();

    if (!step.validationRules || step.validationRules.length === 0) {
      // Pas de règles, toujours valide
      this.state.isValid.set(step.order, true);
      return true;
    }

    const isValid = step.validationRules.every((rule) => rule.rule(data));
    this.state.isValid.set(step.order, isValid);
    return isValid;
  }

  isStepValid(stepIndex: number): boolean {
    return this.state.isValid.get(stepIndex) || false;
  }

  getValidationErrors(stepIndex: number): string[] {
    const step = this.config.steps[stepIndex];
    const data = this.state.stepsData.get(step.id)!;

    if (!step.validationRules) return [];

    return step.validationRules
      .filter((rule) => !rule.rule(data))
      .map((rule) => rule.message);
  }

  getCurrentStepIndex(): number {
    return this.state.currentStep;
  }

  getStepCount(): number {
    return this.config.steps.length;
  }

  getAllStepsData(): Map<string, StepData> {
    return this.state.stepsData;
  }

  exportData(): Record<string, any> {
    const result: Record<string, any> = {};
    this.state.stepsData.forEach((data, stepId) => {
      result[stepId] = data;
    });
    return result;
  }
}
