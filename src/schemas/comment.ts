import { z } from "zod";

export const postCommentSchema = z.object({
  postId: z.coerce.number().int().positive(),
  authorName: z.string().trim().min(2).max(80),
  content: z.string().trim().min(2).max(1000),
  rating: z.coerce.number().int().min(1).max(5).optional()
});

export type PostCommentInput = z.infer<typeof postCommentSchema>;
