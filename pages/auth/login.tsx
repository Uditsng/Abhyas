export default function Login() {
  return (
    <div 
    className="min-h-screen flex items-center justify-center bg-grey-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form>
          <input type="email" placeholder="email" className="w-full mb-4 p-3 border border-grey-300 rounded-2xl" />
          <input type="password" placeholder="password" className="w-full mb-4 p-3 border border-grey-300 rounded-2xl" />
          <button type="submit" className="w-full bg-blue-400 text-white py-2 rounded-2xl hover:bg-blue-700">Login</button>
        </form>
      </div>
    </div>
  );
}
