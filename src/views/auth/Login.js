import { MainContext } from "context/MainContext";
import React, { useContext, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import httpService from "utility/httpService";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { loading, setLoading, notifySuccess, notifyError, notifyWarning } =
    useContext(MainContext);
  const history = useHistory();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const data = await httpService.post("/user/login", {
        username: formData.email,
        password: formData.password,
      });


      if (data?.data?.token) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("sidebar", JSON.stringify(data.data.sidebar));
        localStorage.setItem(
          "organization",
          JSON.stringify(data.data.organization)
        );

        notifySuccess(data.responseMessage, 3000);

        const homeurl = data.data.sidebar.find((side) => {
          if (side.url.includes("/dashboard/customers")) {
            return side;
          }
        });
 
        if (data.data.r == "ur") history.push(homeurl?.url)
        if (data.data.r == "ar") history.push("/dashboard");
      }
    } catch (err) {
      notifyError(err.message, err.data, 4000);
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
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Email"
                    required
                  />
                </div>

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

                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none w-full ease-linear transition-all duration-150"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="flex flex-wrap mt-6 relative">
            <div className="w-1/2">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-blueGray-200"
              >
                <small>Forgot password?</small>
              </a>
            </div>
            <div className="w-1/2 text-right">
              <Link to="/auth/register" className="text-blueGray-200">
                <small>Create new account</small>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
