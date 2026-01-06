"use client";

export default function Home() {
  const getMurderer = async () => {
    let output = "";

    const res = await fetch('/api/users');
    if (!res.ok) {
      alert(`an error occured: ${res.status} ${res.statusText}`);
    }

    const data: {user: string, count: number}[] = await res.json();
    data.sort((a, b) => b.count - a.count);

    for (const a of data) {
      output += `${a.user}: ${a.count} threats sent\n`;
    }

    alert(output);
  }

  return (
    <div className="bg-zinc-1000 min-h-screen flex items-center justify-center">
      <div className="bg-zinc-900 p-6 rounded-md shadow-md">
        <form action="chat" className="flex flex-col gap-4">
          <label className="text-white text-lg px-4">Log in to send death threats</label>
          <div className="gap-2 flex flex-col">
            <label className="text-zinc-400">Username</label>
            <input type="text" name="name" className="bg-zinc-800 px-4 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-white"/>
          </div>
          <input type="submit" className="cursor-pointer bg-white px-4 py-1 rounded-md text-black hover:bg-gray-200 focus:outline-none focus:bg-gray-200" value="Log in"/>
        </form>
        <br/>
        <a onClick={() => getMurderer()} className="underline cursor-pointer text-xs text-gray-400">who's the murderer?</a>
      </div>
    </div>
  );
}
