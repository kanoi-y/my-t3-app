import { z } from "zod";

import { publicProcedure, router } from "../trpc";

export const todoRouter = router({
  getTodos: publicProcedure.query(({ ctx }) => {
    if (!ctx.session?.user) {
      throw new Error("ログインユーザーが存在しません");
    }

    return ctx.prisma.todo.findMany();
  }),
  getTodoById: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new Error("ログインユーザーが存在しません");
      }

      return ctx.prisma.todo.findUnique({
        where: {
          id: input.id,
        },
      });
    }),
  createTodo: publicProcedure
    .input(z.object({ title: z.string().min(1) }))
    .mutation(({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new Error("ログインユーザーが存在しません");
      }

      return ctx.prisma.todo.create({
        data: {
          title: input.title,
          userId: ctx.session.user.id,
        },
      });
    }),
  deleteTodo: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new Error("ログインユーザーが存在しません");
      }

      const todo = await ctx.prisma.todo.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!todo) {
        throw new Error("対象のTodoが存在しません");
      }

      if (todo.userId !== ctx.session.user.id) {
        throw new Error("Todoを削除する権限がありません");
      }

      return ctx.prisma.todo.delete({
        where: {
          id: input.id,
        },
      });
    }),
  updateTodo: publicProcedure
    .input(z.object({ id: z.string().min(1), completed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new Error("ログインユーザーが存在しません");
      }

      const todo = await ctx.prisma.todo.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!todo) {
        throw new Error("対象のTodoが存在しません");
      }

      if (todo.userId !== ctx.session.user.id) {
        throw new Error("対象のodoを更新する権限がありません");
      }

      return ctx.prisma.todo.update({
        where: {
          id: input.id,
        },
        data: {
          completed: input.completed,
        },
      });
    }),
});
