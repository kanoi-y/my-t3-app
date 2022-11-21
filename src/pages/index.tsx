import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import type { FC, FormEventHandler } from "react";
import { useState } from "react";

import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <div className="flex flex-col items-center gap-2">
            <TodoList />
            <AuthShowcase />
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;

// TODO: 削除と更新のUIを作成して検証する
// TODO: TodoListをコンポーネント化する
const TodoList: FC = () => {
  const utils = trpc.useContext();
  const todos = trpc.todo.getTodos.useQuery();
  const createTodo = trpc.todo.createTodo.useMutation({
    async onSuccess() {
      // refetches posts after a post is added
      await utils.todo.getTodos.invalidate();
    },
  });

  const [todoTitle, setTodoTitle] = useState("");
  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (todoTitle.trim().length === 0) return;
    await createTodo.mutateAsync({ title: todoTitle });
    setTodoTitle("");
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="border p-2"
          type="text"
          value={todoTitle}
          onChange={(e) => setTodoTitle(e.target.value)}
        />
        <button className="bg-gray-200 p-2">追加</button>
      </form>
      <div>
        {todos.data ? (
          todos.data.map((todo) => {
            return <div key={todo.id}>{todo.title}</div>;
          })
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </>
  );
};

const AuthShowcase: FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => signOut() : () => signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
