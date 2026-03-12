'use client';

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const handlelogin = () => {
    router.push("/auth/login");
  };

  const handlesignup = () => {
    router.push("/auth/signup");
  };

  return (
    <div className="min-h-screen">
      <p className="text">Home Page</p>
      <button onClick={handlelogin} className="m-10 p-4 bg-blue-400 rounded-2xl text-white hover:bg-blue-800">Login</button>
      <button onClick={handlesignup} className="m-10 p-4 bg-blue-400 rounded-2xl text-white hover:bg-blue-800">Signup</button>

    </div>
  );
}
