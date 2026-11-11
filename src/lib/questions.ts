export interface QuestionAuthor {
  _id: string;
  fullName: string;
}

export interface QuestionAnswerer {
  _id: string;
  fullName: string;
  storeName?: string;
}

export interface ProductQuestion {
  _id: string;
  product: string;
  seller: string;
  author: QuestionAuthor;
  question: string;
  answer?: string | null;
  answeredBy?: QuestionAnswerer | null;
  answeredAt?: string | null;
  status: "unanswered" | "answered" | "hidden";
  createdAt: string;
  updatedAt: string;
}

export interface QuestionListResponse {
  questions: ProductQuestion[];
  total: number;
  page: number;
  pages: number;
}

const STATIC_QUESTIONS: ProductQuestion[] = [
  {
    _id: "q-1",
    product: "any",
    seller: "seller-football-wears",
    author: { _id: "u1", fullName: "David K." },
    question: "Is this the Player Issue version or the Stadium Fan version? How is the fit?",
    answer: "This is the Authentic Player Issue edition (HEAT.RDY / Dri-FIT ADV) featuring the heat-applied silicone crest and athletic slim-fit cut. If you prefer a relaxed or looser street fit, we recommend going one size up!",
    answeredBy: { _id: "s1", fullName: "Hamad", storeName: "Football Wears Pro Shop" },
    answeredAt: "2025-01-15T12:00:00.000Z",
    status: "answered",
    createdAt: "2025-01-15T10:00:00.000Z",
    updatedAt: "2025-01-15T12:00:00.000Z",
  },
  {
    _id: "q-2",
    product: "any",
    seller: "seller-football-wears",
    author: { _id: "u2", fullName: "Samuel Ade" },
    question: "Can I customize this shirt with my own name and number?",
    answer: "Yes, absolutely! We offer official player font lettering as well as custom personalization. Simply select your option or leave a note during checkout with your preferred Name & Number.",
    answeredBy: { _id: "s1", fullName: "Hamad", storeName: "Football Wears Pro Shop" },
    answeredAt: "2025-01-18T14:30:00.000Z",
    status: "answered",
    createdAt: "2025-01-18T11:00:00.000Z",
    updatedAt: "2025-01-18T14:30:00.000Z",
  },
];

export async function listProductQuestions(productId: string, page = 1): Promise<QuestionListResponse> {
  return {
    questions: STATIC_QUESTIONS,
    total: STATIC_QUESTIONS.length,
    page: 1,
    pages: 1,
  };
}

export async function listProductQuestionsServer(productId: string): Promise<QuestionListResponse> {
  return {
    questions: STATIC_QUESTIONS,
    total: STATIC_QUESTIONS.length,
    page: 1,
    pages: 1,
  };
}

export async function askProductQuestion(productId: string, question: string) {
  const newQ: ProductQuestion = {
    _id: `q-${Date.now()}`,
    product: productId,
    seller: "seller-football-wears",
    author: { _id: "curr", fullName: "You" },
    question,
    answer: "Thanks for asking! Our kit expert will review and answer shortly.",
    answeredBy: { _id: "s1", fullName: "Hamad", storeName: "Football Wears Pro Shop" },
    answeredAt: new Date().toISOString(),
    status: "answered",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return { message: "Question submitted", question: newQ };
}

export async function answerProductQuestion(questionId: string, answer: string): Promise<{ message: string; question: ProductQuestion }> {
  const q = STATIC_QUESTIONS.find((item) => item._id === questionId) || STATIC_QUESTIONS[0];
  const updated: ProductQuestion = {
    ...q,
    answer,
    status: "answered",
    answeredAt: new Date().toISOString(),
    answeredBy: { _id: "s1", fullName: "Hamad", storeName: "Football Wears Pro Shop" },
  };
  return { message: "Answer posted", question: updated };
}
