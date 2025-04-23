'use client'
export default function RegisterPage() {

  return (
    <>
       <title>Register | Mock Test App</title>
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl text-center font-bold mb-6">Register</h1>
        <form>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border border-gray-400 rounded-2xl mb-4 p-3"
            onChange={(e) => setName(e.target.value)}

          />
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-400 rounded-2xl mb-4 p-3"
            onChange={(e) => setEmail(e.target.value)}

          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-400 rounded-2xl mb-4 p-3"
            onChange={(e) => setPassword(e.target.value)}

          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-2xl p-3 hover:bg-green-700">
            Register
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
