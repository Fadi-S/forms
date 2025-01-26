import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { ROOT_URL, API_KEY, API_SECRET } from "../../app/consts";

interface Form {
  id: number
  name: string
  slug: string
  questions: Question[]
}

interface Question {
  id: number
  title: string
  picture: string|null
  type: QuestionType
  options: Option[]
}

interface Option {
  id: number
  name: string
  order: number
  picture: string|null
}

enum QuestionType {
  Choose = 1,
  Written = 2,
  Order = 3,
}

interface FormApiResponse {
  quiz: Form
}

// Define a service using a base URL and expected endpoints
export const formsApiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: ROOT_URL,
    prepareHeaders: (headers, {}) => {
      const key = btoa(API_KEY + ":" + API_SECRET);
      headers.set("Authorization", `Basic ${key}`);

      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  reducerPath: "formsApi",
  tagTypes: ["Forms"],
  endpoints: build => ({
    getForm: build.query<FormApiResponse, string>({
      query: () => `/quizzes/junior-6/استبيان-معسكر-٢٠٢٥`,
      providesTags: (_, __, id) => [{ type: "Forms", id }],
    }),
  }),
})

export const { useGetFormQuery } = formsApiSlice

export type { Form, Question, Option };

export { QuestionType };