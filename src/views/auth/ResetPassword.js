import React, { useEffect, useState, useContext } from "react";
import { useHistory, useLocation } from "react-router-dom";
import httpService from "utility/httpService";
import { MainContext } from "context/MainContext";

export default function ResetPasswordLanding() {
  const { loading, setLoading, notifySuccess, notifyError } =
    useContext(MainContext);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [userDate, setUserDate] = useState({ email: "", code: "" });
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  const history = useHistory();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const resetCode = queryParams.get("code");

  useEffect(() => {
    const verifyCode = async () => {
      if (!resetCode) {
        setError("Invalid reset link!");
        return;
      }

      setLoading(true);
      try {
        const res = await httpService.get(
          `/user/verify-reset-link/${resetCode}`
        );

        console.log("response from verify :: ", res);

        if (res?.responseCode == "0000") {
          setUserDate(res?.data);
          setVerified(true);
          notifySuccess("Code verified. Please set a new password.", 3000);
        } else {
          setError("Invalid or expired reset link.");
        }
      } catch (err) {
        notifyError(err.message || "Verification failed", err.data, 4000);
        setError("Invalid or expired reset link.");
      } finally {
        setLoading(false);
      }
    };

    verifyCode();
  }, [resetCode]);

  // ✅ Handle form input
  const handleChange = (e) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ✅ Handle form submit (update password)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (passwordData.password !== passwordData.confirmPassword) {
      return setError("Passwords do not match!");
    }

    setLoading(true);
    try {
      const res = await httpService.post("/user/change-password", {
        code: resetCode,
        email: userDate.email,
        newPassword: passwordData.password,
      });
      notifySuccess(res.responseMessage || "Password reset successful!", 3000);
      history.push("/auth/login");
    } catch (err) {
      notifyError(err.message || "Failed to reset password", err.data, 4000);
      setError("Failed to update password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 h-full">
      <div className="flex content-center items-center justify-center h-full">
        <div className="w-full lg:w-4/12 px-4">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0">
            <div className="flex-auto px-4 lg:px-10 py-10 pt-0 my-6 text-center">
              {!verified ? (
                <>
                  <h2 className="text-lg font-semibold mb-4 text-blueGray-700">
                    Verifying your reset link...
                  </h2>
                  {error && (
                    <p className="text-red-500 text-sm mt-2 text-center">
                      {error}
                    </p>
                  )}
                </>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h2 className="text-lg font-semibold mb-4 text-blueGray-700">
                    Set a New Password
                  </h2>

                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={passwordData.password}
                      onChange={handleChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Enter new password"
                      required
                    />
                  </div>

                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handleChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm mb-3 text-center">
                      {error}
                    </p>
                  )}

                  <div className="text-center mt-6">
                    <button
                      type="submit"
                      className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none w-full ease-linear transition-all duration-150"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
