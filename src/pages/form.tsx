import { useState, useEffect } from "react";
import { Option, Question, QuestionType, useGetFormQuery } from "../features/forms/formsApiSlice";
import Loading from "../components/loading";


export default function ShowQuiz() {
  const { data, isLoading } = useGetFormQuery("junior-6/استبيان-معسكر-٢٠٢٥");
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // Initialize answers state when form data is loaded
  useEffect(() => {
    if (data) {
      const initialAnswers: Record<string, any> = {};
      data.quiz.questions.forEach((question) => {
        if (question.type === QuestionType.Order) {
          initialAnswers[question.id] = question.options.map((opt) => opt.order);
        } else {
          initialAnswers[question.id] = "";
        }
      });
      setAnswers(initialAnswers);
    }
  }, [data]);

  // Handle reordering for Order type questions
  const handleMoveUp = (questionId: string, index: number) => {
    setAnswers((prev) => {
      const currentOrder = [...prev[questionId]];
      if (index === 0) return prev;
      [currentOrder[index - 1], currentOrder[index]] = [currentOrder[index], currentOrder[index - 1]];
      return { ...prev, [questionId]: currentOrder };
    });
  };

  const handleMoveDown = (questionId: string, index: number) => {
    setAnswers((prev) => {
      const currentOrder = [...prev[questionId]];
      if (index === currentOrder.length - 1) return prev;
      [currentOrder[index], currentOrder[index + 1]] = [currentOrder[index + 1], currentOrder[index]];
      return { ...prev, [questionId]: currentOrder };
    });
  };

  // Handle input changes for Choose type questions
  const handleChooseChange = (questionId: string, order: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: order }));
  };

  // Handle input changes for Written type questions
  const handleWrittenChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // Render options for Order type questions
  function renderOrderOptions(question: Question) {
    const orderedOrders = answers[question.id] || [];
    const orderedOptions = orderedOrders
      .map((order : number) => question.options.find((opt) => opt.order === order))
      .filter((opt : Option): opt is NonNullable<typeof opt> => !!opt);

    return (
      <div className="flex flex-col space-y-4 items-start mt-6">
        {orderedOptions.map((option: Option, index: number) => (
          <div key={`option-${option.id}`} className="border border-gray-900 px-2 py-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMoveUp(question.id.toString(), index)}
              disabled={index === 0}
              className="disabled:opacity-50"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => handleMoveDown(question.id.toString(), index)}
              disabled={index === orderedOptions.length - 1}
              className="disabled:opacity-50"
            >
              ↓
            </button>
            <span>{option.name}</span>
          </div>
        ))}
      </div>
    );
  }

  // Render options for Written type questions
  function renderWrittenOptions(question: Question) {
    return (
      <div key={`input-${question.id}`} className="py-2">
        <input
          value={answers[question.id] || ""}
          onChange={(e) => handleWrittenChange(question.id.toString(), e.target.value)}
          placeholder="...."
          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
          type="text"
          id={`input-${question.id}`}
          name={question.id.toString()}
        />
      </div>
    );
  }

  // Render options for Choose type questions
  function renderChooseOptions(question: Question) {
    return question.options.map((option) => (
      <div key={option.id} className="flex items-center my-2">
        <input
          id={option.id.toString()}
          name={question.id.toString()}
          type="radio"
          onChange={() => handleChooseChange(question.id.toString(), option.order)}
          checked={answers[question.id] === option.order}
          className="relative size-5 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-blue-600 checked:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
        />
        <label htmlFor={option.id.toString()} className="mx-3 block text-lg text-gray-900">
          {option.name}
        </label>
      </div>
    ));
  }

  // Render question options based on type
  function renderQuestionOptions(question: Question) {
    if (question.type === QuestionType.Choose) {
      return renderChooseOptions(question);
    }

    if (question.type === QuestionType.Order) {
      return renderOrderOptions(question);
    }

    if (question.type === QuestionType.Written) {
      return renderWrittenOptions(question);
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form answers:", answers);
  };

  // Show loading state while data is being fetched
  if (isLoading || !data) {
    return <Loading />;
  }

  const form = data.quiz;

  return (
    <div className="py-6 h-full">
      <h1 className="text-2xl text-center font-bold">{form.name}</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 w-full mt-12" dir="auto">
          {form.questions.map((question) => (
            <div key={question.id} className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-xl">{question.title}</h2>
              {renderQuestionOptions(question)}
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full mt-4 rounded-md bg-blue-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
}