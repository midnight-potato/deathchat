"use client";
import { useSearchParams } from "next/navigation";
import { useRef, useEffect, FormEvent, useState, Suspense } from "react";

const COLORS = [
  "#B71C1C", "#880E4F", "#4A148C", "#311B92",
  "#1A237E", "#0D47A1", "#01579B", "#006064",
  "#004D40", "#1B5E20", "#33691E", "#827717",
  "#E65100", "#BF360C", "#3E2723", "#263238"
];

function Chat() {
  const params = useSearchParams();
  const name = params.get("name");
  let socket: WebSocket;

  const [text, setText] = useState("");
  const colorIndex = useRef(0);
  const userColors = useRef(new Map<string, string>());

  if (!name) {
    alert("name cannot be empty");
    location.href = "/"
  }

  const onmessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type == "message") {
        if (!userColors.current.has(data.user)) {
          userColors.current.set(data.user, COLORS[colorIndex.current]);
          colorIndex.current = (colorIndex.current + 1) % COLORS.length;
        }
        const color = userColors.current.get(data.user);
        
        setText(prev => `${prev}
          <span style="font-weight: bold; background-color: ${color}; padding: 4px; border-radius: 4px; overflow-wrap: break-word;">${data.user}:</span> 
          <span style="overflow-wrap: break-word;">${data.message}</span>
          <br/>
        `);
      }
    } catch {
      console.log("this potato failed something");
    }
  };

  const onclose = () => {
    console.log('Socket closed, reconnecting in 1 second')
    setTimeout(connect, 1000)
  }

  const connect = () => {
    socket = new WebSocket(`${location.origin}/api/socket`)
    socket.onmessage = onmessage
    socket.onclose = onclose
  }

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

    if (inputRef.current) {
      inputRef.current.value = "";
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
  }

  useEffect(() => {
    focus();
    connect();
    return () => socket.close();
  }, []);

  return (
    <div className="bg-zinc-1000 h-[100dvh] overflow-hidden flex flex-col justify-between" onClick={focus}>
      <div dangerouslySetInnerHTML={{ __html: text }} className="p-6 flex-1 overflow-y-auto">
      </div>
      <form className="bg-zinc-900 p-6 flex flex-row gap-4 shrink-0" onSubmit={send}>
        <input
          type="text"
          placeholder="Message"
          className="bg-zinc-800 w-full px-4 py-2 rounded-md focus:outline-none"
          ref={inputRef}
        />
        <input
          type="submit"
          value="ᯓ➤"
          className="cursor-pointer px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 focus:outline-none focus:bg-gray-200"
        />
      </form>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading</p>}>
      <Chat/>
    </Suspense>
  )
}
