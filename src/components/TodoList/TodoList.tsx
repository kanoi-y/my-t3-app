import type { FC, FormEventHandler } from "react";
import { useState } from "react";
import { trpc } from "~/utils/trpc";

export const TodoList: FC = () => {
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
