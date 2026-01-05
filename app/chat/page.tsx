"use client";
import { useSearchParams } from "next/navigation";
import { useRef, useEffect } from "react";

export default function Home() {
  const params = useSearchParams();
  const name = params.get("name");

  const inputRef = useRef<HTMLInputElement>(null);

  const focus = () => {
    inputRef.current?.focus();
  }

  useEffect(() => {
    focus()
  });

  return (
    <div className="bg-zinc-900 min-h-screen flex flex-col justify-between" onClick={focus}>
      <div>
      </div>
      <form className="flex flex-row" method="POST">
        <input
          type="text"
          placeholder="Message"
          className="bg-zinc-800 w-full p-4 rounded-md"
          ref={inputRef}
        />
        <input
          type="submit"
          value="ᯓ➤"
          className="p-4 m-1 bg-white text-black rounded-md"
        />
      </form>
    </div>
  );
}
