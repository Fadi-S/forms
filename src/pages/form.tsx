import { Question, QuestionType, useGetFormQuery } from "../features/forms/formsApiSlice"
import Loading from "../components/loading"

export default function ShowQuiz() {
  // const dispatch = useAppDispatch()

  const { data, isLoading } = useGetFormQuery("junior-6/استبيان-معسكر-٢٠٢٥")
  if (isLoading || data === undefined) {
    return <Loading />
  }

  const form = data.quiz;



  function renderQuestionOptions(question : Question) {
    if(question.type === QuestionType.Choose) {
      return renderChooseOptions(question);
    }

    if(question.type === QuestionType.Order) {
      return renderOrderOptions(question);
    }

    if(question.type === QuestionType.Written) {
      return renderWrittenOptions(question);
    }
  }

  function renderOrderOptions(question : Question) {
    let i = 1;

    return (
      <div className="flex flex-col space-y-4 items-start mt-6">
        {question.options.map((option) => (
          <div key={option.id} className="border border-gray-900 px-2 py-1 block text-lg text-gray-900">
            {i++}) {option.name}
          </div>
        ))}
      </div>
    )
  }

  function renderWrittenOptions(question: Question) {
    return <div key={`input-${question.id}`} className="py-2">

      <input
        placeholder="...."
        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
        type="text" id={`input-${question.id}`} name={question.id.toString()} />
    </div>
  }

  function renderChooseOptions(question: Question) {
    return question.options.map((option) => (
      <div key={option.id} className="flex items-center my-2">
        <input
          id={option.id.toString()}
          name="notification-method"
          type="radio"
          className="relative size-5 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-blue-600 checked:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
        />
        <label htmlFor={option.id.toString()} className="mx-3 block text-lg text-gray-900">
          {option.name}
        </label>
      </div>
    ))
  }

  return (
    <div className="py-6 h-full">
      <h1 className="text-2xl text-center font-bold">{form.name}</h1>

      <form>
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
  )
}