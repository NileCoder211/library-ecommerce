 import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LogIn, Mail, Lock, ArrowRight, Loader } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, loading } = useUserStore();

  const handleSubmit = (e) => {
    e.preventDefault();
   
    login(email, password);
  };

  
const handleGoogleLogin = () => {
  window.location.href =
    "http://localhost:5000/api/auth/google";
};

  return (
    <div className="flex flex-col justify-center py-2 sm:px-6 lg:px-8">
      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="mt-3 text-center text-3xl font-extrabold text-black">
          Login to your account
        </h2>
      </motion.div>

      <motion.div
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className=" space-y-5
    bg-[#fcfcfc]
    border border-gray-300
    shadow-[0_8px_30px_rgba(0,0,0,0.06)]
    rounded-2xl
    p-6 md:p-8        py-8 px-4  sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-400"
              >
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className=" block w-full
                           bg-white
                             border 
                             border-gray-300
                             text-black
                             p-3
                             focus:outline-none
                            focus:ring-2
                           focus:ring-black 
                            px-3 py-2 pl-10   
                            rounded-md shadow-sm
                             placeholder-gray-400   
                             sm:text-sm"
                  placeholder="youremail@gmail.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-400"
              >
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className=" block w-full
                           bg-white
                             border 
                             border-gray-300
                             text-black
                             p-3
                             focus:outline-none
                            focus:ring-2
                           focus:ring-black 
                            px-3 py-2 pl-10   
                            rounded-md shadow-sm
                             placeholder-gray-400   
                             sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent 
							rounded-md shadow-sm text-sm font-medium text-white bg-black
							 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2
							  focus:ring-black transition duration-150 ease-in-out disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader
                    className="mr-2 h-5 w-5 animate-spin"
                    aria-hidden="true"
                  />
                  Loading...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" aria-hidden="true" />
                  Login
                </>
              )}
            </button>
<div className="w-full">
  <button
    onClick={handleGoogleLogin}
    className="w-full flex items-center justify-center gap-3 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 active:scale-[0.98]"
  >
    <img
      src="https://developers.google.com/identity/images/g-logo.png"
      alt="Google logo"
      className="h-5 w-5 rounded-full bg-white p-0.5"
    />

    <span>Continue with Google</span>
  </button>
</div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Not a member?{" "}
            <Link
              to="/signup"
              className="font-medium text-gray-500 hover:text-gray-900"
            >
              Sign up now <ArrowRight className="inline h-4 w-4" />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
export default LoginPage;
 