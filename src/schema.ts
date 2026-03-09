import { z } from 'zod';

export const SearchQuerySchema = z.object({
  search_query: z.string().describe("A highly specific and targeted query for web search.")
});

export const FeedbackSchema = z.object({
  grade: z.enum(["pass", "fail"]).describe("Evaluation result. 'pass' if the research is sufficient, 'fail' if it needs revision."),
  comment: z.string().describe("Detailed explanation of the evaluation, highlighting strengths and/or weaknesses of the research."),
  follow_up_queries: z.array(SearchQuerySchema).optional().describe("A list of specific, targeted follow-up search queries needed to fix research gaps.")
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type Feedback = z.infer<typeof FeedbackSchema>;
