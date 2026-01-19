import { MainContext } from "context/MainContext";
import React, { useContext, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import httpService from "utility/httpService";
import { FEATURE_ALIASES, resolveHomepageByRole } from "utility/RolesConfig";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [forgotData, setForgotData] = useState({ email: "" });
  const [error, setError] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [sendBtnName, setSendBtnName] = useState("Send reset link");
  const [isSendDisabled, setIsSendDisabled] = useState(false); // ✅ New state

  const { loading, setLoading, notifySuccess, notifyError } =
    useContext(MainContext);
  const history = useHistory();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isForgotPassword) setForgotData((prev) => ({ ...prev, [name]: value }));
    else setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await httpService.post("/user/login", {
        username: formData.email,
        password: formData.password,
      });

      const { token, sidebar, organization, role } = res.data || {};

      if (!token) throw new Error("Invalid login response");

      localStorage.setItem("token", token);
      localStorage.setItem("roles", JSON.stringify(role || []));
      localStorage.setItem("sidebar", JSON.stringify(sidebar || []));
      localStorage.setItem("organization", JSON.stringify(organization));

      notifySuccess(res.responseMessage, 3000);

      const homePath = resolveHomepageByRole(role);


      history.replace(homePath);
    } catch (err) {
      notifyError(err.message || "Login failed", err.data, 4000);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotData.email) return setError("Please enter valid email.");
    setLoading(true);
    setError("");
    setIsSendDisabled(true); // ✅ Disable immediately

    try {
      const data = await httpService.get(
        `/user/send-reset-link/${forgotData.email}`
      );

      notifySuccess(data.responseMessage || "Password reset email sent!", 3000);

      // ✅ Start 10-second timer
      setTimeout(() => {
        setIsSendDisabled(false);
        setSendBtnName("Didn’t get the reset link? Resend");
      }, 20000);
    } catch (err) {
      notifyError(err.message || "Failed to send reset email", err.data, 4000);
      setError("Email not found");
      setIsSendDisabled(false); // ✅ Re-enable if error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 h-full">
      <div className="flex content-center items-center justify-center h-full">
        <div className="w-full lg:w-4/12 px-4">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0">
            <div className="flex-auto px-4 lg:px-10 py-10 pt-0 my-6">
              {/* ✅ Conditional Form Rendering */}
              {!isForgotPassword ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                  }}
                >
                  {/* Username */}
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Email"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Password"
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm mb-3 text-center">
                      {error}
                    </p>
                  )}

                  {/* Sign In Button */}
                  <div className="text-center mt-6">
                    <button
                      type="submit"
                      className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none w-full ease-linear transition-all duration-150"
                      disabled={loading}
                    >
                      {loading ? "Signing in..." : "Sign In"}
                    </button>
                  </div>
                </form>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleForgotPassword();
                  }}
                >
                  {/* Forgot Password Email Field */}
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Enter your registered email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={forgotData.email}
                      onChange={handleChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Email"
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm mb-3 text-center">
                      {error}
                    </p>
                  )}

                  {/* Send Reset Link Button */}
                  <div className="text-center mt-6">
                    <button
                      type="submit"
                      className={`bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none w-full ease-linear transition-all duration-150 ${
                        isSendDisabled || loading
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={loading || isSendDisabled}
                    >
                      {loading ? "Sending..." : sendBtnName}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* ✅ Toggle Links */}
          <div className="flex flex-wrap mt-6 relative">
            <div className="w-1/2">
              {!isForgotPassword ? (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsForgotPassword(true);
                  }}
                  className="text-blueGray-500 hover:text-blueGray-700"
                >
                  <small>Forgot password?</small>
                </a>
              ) : (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsForgotPassword(false);
                  }}
                  className="text-blueGray-500 hover:text-blueGray-700"
                >
                  <small>Back to login</small>
                </a>
              )}
            </div>

            {/* {!isForgotPassword && (
              <div className="w-1/2 text-right">
                <Link
                  to="/auth/register"
                  className="text-blueGray-500 hover:text-blueGray-700"
                >
                  <small>Create new account</small>
                </Link>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
}
