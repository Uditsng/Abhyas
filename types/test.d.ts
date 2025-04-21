export type Question = {
    id: string;
    question: string;
    options: string[];
    answer: string;
  };
  
  export type Test = {
    id: string;
    title: string;
    duration: number;
    totalQuestions: number;
  };
  
  