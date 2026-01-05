"use client";
import { useSearchParams } from "next/navigation";
import { useRef, useEffect, FormEvent, useState } from "react";

export default function Home() {
  const params = useSearchParams();
  const name = params.get("name");
  const socket = new WebSocket('wss://api/socket');

  const [text, setText] = useState("");

  if (!name) {
    alert("name cannot be empty");
    location.href = "/"
  }

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type == "message") {
        setText(`${text}${data.user}: ${data.message}\n`);
      }
    } catch {
      console.log("this potato failed something");
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const focus = () => {
    inputRef.current?.focus();
  }

  const send = async (e: FormEvent) => {
    e.preventDefault();
    
    const params = {
      "user": name,
      "message": inputRef.current?.value,
    }

    const res = await fetch("/api/send", {
      method: "POST",
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      let json = null;

      try {
        json = await res.json();
      } catch (e) {}

      alert(
        `Error "${res.statusText}" occured when sending your message${json? `: ${json.reasoning}` : "."}`
      );
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  useEffect(() => {
    focus();
  });

  return (
    <div className="bg-zinc-900 min-h-screen flex flex-col justify-between" onClick={focus}>
      <div>
        {text}
      </div>
      <form className="flex flex-row" onSubmit={send}>
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
