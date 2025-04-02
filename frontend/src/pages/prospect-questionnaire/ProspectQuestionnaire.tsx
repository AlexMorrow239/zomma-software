import { useState } from "react";

import { Button } from "@/components/common/button/Button";

import BudgetStep from "./components/budget-step/BudgetStep";
import ContactStep from "./components/contact-step/ContactStep";
import GoalsStep from "./components/goals-step/GoalsStep";
import ServicesStep from "./components/service-step/ServiceStep";
import SuccessMessage from "./components/success-message/SuccessMessage";
import "./ProspectQuestionnaire.scss";
import { ProspectFormData } from "./schema";
import { useProspectForm } from "./useProspectForm";

const services = [
  {
    id: "Tax Compliance + Tax Advisory",
    name: "Tax Compliance + Tax Advisory",
    description: "Tax preparation and planning services",
  },
  {
    id: "Sports + Entertainment",
    name: "Sports + Entertainment",
    description: "",
  },
  {
    id: "Assurance Services",
    name: "Assurance Services",
    description: "Financial audit and assurance services",
  },
  {
    id: "Peer Review",
    name: "Peer Review",
    description: "Certified Peer Review",
  },
  {
    id: "Accounting Services",
    name: "Accounting Services",
    description: "Regular bookkeeping and accounting services",
  },
];

export default function ProspectQuestionnaire() {
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    form,
    currentStep,
    isSubmitting,
    handleNextStep,
    handlePreviousStep,
    handleSubmit,
  } = useProspectForm();

  const {
    formState: { errors },
    watch,
    setValue,
  } = form;

  const onSubmit = async (data: ProspectFormData) => {
    try {
      await handleSubmit(data);
      setSubmitSuccess(true);
    } catch (error) {
      // Error is already handled in useProspectForm
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <ContactStep form={form} errors={errors} />;
      case 2:
        return <GoalsStep form={form} errors={errors} />;
      case 3:
        return (
          <ServicesStep
            errors={errors}
            watch={watch}
            setValue={setValue}
            services={services}
          />
        );
      case 4:
        return <BudgetStep form={form} errors={errors} />;
      default:
        return null;
    }
  };

  if (submitSuccess) {
    return <SuccessMessage />;
  }

  return (
    <div className="questionnaire">
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="form-header">
          <div className="progress-sections">
            {["Contact", "Goals", "Services", "Budget"].map(
              (section, index) => (
                <div
                  key={section}
                  className={`progress-section ${
                    currentStep === index + 1 ? "active" : ""
                  }`}
                >
                  <span className="section-number">{index + 1}</span>
                  <span className="section-title">{section}</span>
                </div>
              )
            )}
          </div>
        </div>

        <div className="form-content">{renderCurrentStep()}</div>

        <div className="form-footer">
          <div className="button-group">
            {currentStep > 1 && (
              <Button
                variant="outline"
                size="md"
                onClick={handlePreviousStep}
                disabled={isSubmitting}
              >
                Previous
              </Button>
            )}

            {currentStep < 4 && (
              <Button
                variant="primary"
                size="md"
                onClick={handleNextStep}
                disabled={isSubmitting}
              >
                Next
              </Button>
            )}

            {currentStep === 4 && (
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                disabled={isSubmitting || !form.formState.isValid}
              >
                Submit Questionnaire
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
