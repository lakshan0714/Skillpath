"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function LoginPage() {

  const BACKEND_HOST= process.env.NEXT_PUBLIC_BACKEND_HOST
  const BACKEND_PORT=process.env.NEXT_PUBLIC_BACKEND_PORT 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      console.log(BACKEND_HOST)
      try {
        const res = await fetch(`http://${BACKEND_HOST}:${BACKEND_PORT}/user/me`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.data?.role === "admin") {
            router.replace("/admin_dashboard/overview");
          } else if (data?.data?.role === "superadmin") {
            router.replace("/super_admin_dashboard/overview");
          }
        }
      } catch (err) {
        // Not authenticated or network error, do nothing
      }
    };
    checkSession();
  }, [router]);

  const validate = () => {
    let valid = true;
    const errors = { email: '', password: '' };
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Enter a valid email address.';
      valid = false;
    }
    if (!password) {
      errors.password = 'Password is required.';
      valid = false;
    }
    setFieldErrors(errors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      const data1 = {
        "email": email,
        "password": password
      }
      console.log(data1)
      const res = await fetch(`http://${BACKEND_HOST}:${BACKEND_PORT}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data1),
        credentials: "include"
      });
      const data = await res.json();
      console.log(data)
      if (res.ok) {
        if (data.data.role === "admin") {
          router.push("/admin_dashboard/overview");
        } else if (data.data.role === "superadmin") {
          router.push("/super_admin_dashboard/overview");
        } else {
          setError("Unknown user type");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center mb-6">
          <Image src="/images/logo.png" alt="Logo" width={75} height={60} />
          <p className=" text-sm text-gray-600">Welcome back!</p>
          <h2 className="mt-8 text-xl font-bold text-center text-gray-900">Log in to your Account</h2>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block font-sans text-xs font-medium  text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className={`mt-1 block w-full px-3 py-2 border ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm`}
            />
            {fieldErrors.email && <div className="text-red-500 text-xs mt-1">{fieldErrors.email}</div>}
          </div>
          <div>
            <label htmlFor="password" className="block font-sans text-xs font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={`mt-1 block w-full px-3 py-2 border ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm`}
            />
            {fieldErrors.password && <div className="text-red-500 text-xs mt-1">{fieldErrors.password}</div>}
          </div>
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="mr-2"
              />
              Remember
            </label>
            <a href="/ (auth)/forgot-password" className="text-blue-800 font-semibold hover:underline">Forgot Password?</a>

          </div>
          {error && <div className="text-red-500 text-xs text-center">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-800 text-white font-semibold rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-2"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}