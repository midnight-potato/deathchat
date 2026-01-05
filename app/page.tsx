export default function Home() {
  return (
    <div className="bg-zinc-900 min-h-screen flex flex-row items-center justify-center">
      <form action="chat">
        <input type="text" name="name" className="bg-zinc-800 p-2 m-1 rounded-md" placeholder="Username"/>
        <input type="submit" className="bg-white p-2 m-1 rounded-md text-black" value="Go"/>
      </form>
    </div>
  );
}
