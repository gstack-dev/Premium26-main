import { useForm, FormProvider } from "react-hook-form";

import Button from "../../ui/Button";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import { FormType } from "../../types/form";
import toast from "react-hot-toast";
import { useAddStudent } from "./useAddStudent";
import { useNavigate } from "react-router";

const validateSteps: Record<number, (keyof FormType)[]> = {
  1: [],
  2: [
    "firstName",
    "lastName",
    "email",
    "phone",
    "university",
    "otherUniversity",
    "faculty",
    "otherFaculty",
    "year",
    "major",
  ],
  3: [
    "firstPreference",
    "secondPreference",
    "thirdPreference",
    "preferencePercentage",
    "previousExperience",
  ],
  4: ["aboutUs"],
};

function Form({
  currentStep,
  setCurrentStep,
}: {
  currentStep: number;
  setCurrentStep: (steps: number) => void;
}) {
  const { isLoading, addStudent } = useAddStudent();
  const navigate = useNavigate();
  const methods = useForm<FormType>();
  function handleNext() {
    // console.log(methods.getValues("firstPreference"));

    methods.trigger(validateSteps[currentStep]).then((isValid) => {
      // console.log(methods.getValues("firstPreference"));

      if (isValid) {
        if (
          currentStep == 3 &&
          (methods.getValues("firstPreference") === "def" ||
            !methods.getValues("firstPreference"))
        )
          return;
        setCurrentStep(currentStep + 1);
      }
    });
  }
  function handleBack() {
    setCurrentStep(currentStep - 1);
  }
  function onSubmit(formData: FormType) {
    addStudent(formData, {
      onSuccess: (data) => {
        toast.success("Form  added successfully!");
        methods.reset();
        localStorage.setItem("studentData", JSON.stringify(data));
        navigate("/success");
      },
    });

    // console.log(finalForm);
  }
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      case 4:
        return <Step4 />;

      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          background: "var(--dark2)",
          border: "3px solid var(--red)",
          boxShadow: "0 0 0 3px var(--dark), 0 0 0 6px var(--red-dark)",
          padding: "2rem",
        }}
      >
        {renderStep()}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "2rem",
          }}
        >
          {currentStep > 1 && (
            <Button isLoading={isLoading} type="button" onClick={handleBack} variant="red">
              ◀ PREVIOUS
            </Button>
          )}
          {currentStep < 4 && (
            <Button type="button" onClick={handleNext} variant="blue">
              NEXT ▶
            </Button>
          )}
          {currentStep === 4 && (
            <Button isLoading={isLoading} type="submit" variant="gold">
              ▶ SUBMIT
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

export default Form;
