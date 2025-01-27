import { useState, useEffect } from "react"
import { Option, Question, QuestionType, useGetFormQuery, useSubmitFormMutation } from "../features/forms/formsApiSlice"
import Loading from "../components/loading"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"

export default function ShowQuiz() {
  const { data, isLoading } = useGetFormQuery("junior-6/استبيان-معسكر-٢٠٢٥")
  const [answers, setAnswers] = useState<Record<string, any>>({})

  const [submitForm, { isSuccess, isLoading: isLoadingForm }] = useSubmitFormMutation()

  // Initialize answers state when form data is loaded
  useEffect(() => {
    if (data) {
      const initialAnswers: Record<string, any> = {}
      data.quiz.questions.forEach((question) => {
        if (question.type === QuestionType.Order) {
          initialAnswers[question.id] = question.options.map((opt) => opt.order)
        } else if (question.type === QuestionType.MultipleChoose) {
          initialAnswers[question.id] = []
        } else {
          initialAnswers[question.id] = ""
        }
      })
      setAnswers(initialAnswers)
    }
  }, [data])

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result

    // If there's no valid destination, do nothing
    if (!destination) return

    // If the item is dropped in the same place, do nothing
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    // Get the question ID from the droppableId
    const questionId = destination.droppableId

    // Create a new copy of the current order
    const newOrder = [...answers[questionId]]

    // Remove the dragged item from its original position
    const [removed] = newOrder.splice(source.index, 1)

    // Insert the dragged item into the new position
    newOrder.splice(destination.index, 0, removed)

    // Update the answers state
    setAnswers((prev) => ({ ...prev, [questionId]: newOrder }))
  }

  // Handle input changes for Choose type questions
  const handleChooseChange = (questionId: string, order: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: order }))
  }

  // Handle input changes for MultipleChoose type questions
  const handleMultipleChooseChange = (questionId: string, order: number) => {
    setAnswers((prev) => {
      const currentAnswers = prev[questionId] || []
      const newAnswers = currentAnswers.includes(order)
        ? currentAnswers.filter((ans: number) => ans !== order) // Remove if already selected
        : [...currentAnswers, order] // Add if not selected
      return { ...prev, [questionId]: newAnswers }
    })
  }

  // Handle input changes for Written type questions
  const handleWrittenChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  // Render options for Order type questions
  function renderOrderOptions(question: Question) {
    const orderedOrders = answers[question.id] || []
    const orderedOptions = orderedOrders
      .map((order: number) => question.options.find((opt) => opt.order === order))
      .filter((opt: Option): opt is NonNullable<typeof opt> => !!opt)

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={question.id.toString()}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex flex-col space-y-4 items-start mt-6"
            >
              {orderedOptions.map((option: Option, index: number) => (
                <Draggable key={`option-${option.id}`} draggableId={`option-${option.id}`} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="border border-gray-900 px-2 py-1 flex items-center gap-2 w-full"
                    >
                      <span>{index + 1}) {option.name}</span>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    )
  }

  function renderWrittenOptions(question: Question) {
    return (
      <div key={`input-${question.id}`} className="py-2">
          <textarea
            dir="auto"
            id={`input-${question.id}`}
            name={question.id.toString()}
            value={answers[question.id] || ""}
            onChange={(e) => handleWrittenChange(question.id.toString(), e.target.value)}
            rows={4}
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
            defaultValue={""}
            placeholder="..."
          />
      </div>
    )
  }

  // Render options for Choose type questions
  function renderChooseOptions(question: Question) {
    return question.options.map((option) => (
      <div key={`option-` + option.id} className="flex items-center my-2">
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
    ))
  }

  // Render options for MultipleChoose type questions
  function renderMultipleChooseOptions(question: Question) {
    return <div className="space-y-2 mt-3">
      {question.options.map((option) => (
        <div className="flex gap-3" key={`option-` + option.id}>
          <div className="flex h-6 shrink-0 items-center">
            <div className="group grid size-5 grid-cols-1">
              <input
                id={option.id.toString()}
                name={question.id.toString()}
                type="checkbox"
                onChange={() => handleMultipleChooseChange(question.id.toString(), option.order)}
                checked={answers[question.id]?.includes(option.order)}
                className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-blue-600 checked:bg-blue-600 indeterminate:border-blue-600 indeterminate:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
              />
              <svg
                fill="none"
                viewBox="0 0 14 14"
                className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25"
              >
                <path
                  d="M3 8L6 11L11 3.5"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-0 group-has-[:checked]:opacity-100"
                />
                <path
                  d="M3 7H11"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-0 group-has-[:indeterminate]:opacity-100"
                />
              </svg>
            </div>
          </div>
          <div className="text-sm/6">
            <label htmlFor={option.id.toString()} className="mx-3 block text-lg text-gray-900">
              {option.name}
            </label>
          </div>
        </div>
      ))}
    </div>
  }

  // Render question options based on type
  function renderQuestionOptions(question: Question) {
    if (question.type === QuestionType.Choose) {
      return renderChooseOptions(question)
    }

    if (question.type === QuestionType.MultipleChoose) {
      return renderMultipleChooseOptions(question)
    }

    if (question.type === QuestionType.Order) {
      return renderOrderOptions(question)
    }

    if (question.type === QuestionType.Written) {
      return renderWrittenOptions(question)
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    submitForm({ answers })
  }

  if (!isLoadingForm && isSuccess) {
    return <div className="py-6 h-full">
      <h1 className="text-2xl text-center font-bold text-green-800">تم تسجيل الاستبيان بنجاح</h1>
    </div>
  }

  // Show loading state while data is being fetched
  if (isLoading || !data) {
    return <Loading />
  }

  const form = data.quiz

  return (
    <div className="py-6 h-full">
      <h1 className="text-3xl text-center font-bold">{form.name}</h1>
      <div dir="auto" className="w-full flex items-center justify-center mt-3">
        <span className="font-semibold text-lg text-gray-800 text-center">{form.data?.description}</span>
      </div>

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
          disabled={isLoadingForm}
          type="submit"
          className="w-full mt-4 rounded-md bg-blue-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <div className="flex items-center w-full justify-center">
            {
              isLoadingForm &&
              <svg className="mr-3 -ml-1 size-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                   viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            }

            <span>Submit</span>
          </div>
        </button>
      </form>
    </div>
  )
}