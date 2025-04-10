"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    if (errorMessage) setErrorMessage("");
  }, [formData, errorMessage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const storedEmail = localStorage.getItem("email");
    const storedPassword = localStorage.getItem("password");
    if (formData.email === storedEmail && formData.password === storedPassword) {
      localStorage.setItem("loggedIn", "true");
      router.push("/pages/Main");
    } else {
      setErrorMessage("Incorrect email or password!");
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-5">
      <h1
        className="text-3xl font-bold mb-5"
        style={{ WebkitTextStroke: "1px black" }}
      >
        Login
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80 mb-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="px-4 py-2 rounded border-none focus:outline-none text-white"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="px-4 py-2 rounded border-none focus:outline-none text-white"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-green-500 hover:bg-green-600 text-black font-bold rounded-full transition-colors"
        >
          Login
        </button>
      </form>
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      <p
        className="mt-4 underline cursor-pointer"
        onClick={() => router.push("/pages/SignUp")}
      >
        Don't have an account? Register
      </p>
    </main>
  );
}