import React, { useState } from "react";
import { toast, Bounce } from "react-toastify";

// Create a new context
export const MainContext = React.createContext();

// Provider component to wrap around components that need access to image data
export function MainProvider({ children }) {
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backdrop, setBackdrop] = useState(false);

  // Function to set image data
  const setImage = (data) => {
    setImageData(data);
  };

  const defaultNotifyConfig = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Bounce,
  };

  const notifyError = (text, desc = "", time) => {
    const config = {
      ...defaultNotifyConfig,
      autoClose: time || defaultNotifyConfig.autoClose,
    };

    if (desc == null || desc === "") {
      toast.error(text, config);
    } else {
      toast.error(
        <div>
          <strong>{text}</strong>
          <p>{desc}</p>
        </div>,
        config
      );
    }
  };

  const notifySuccess = (text, time) => {
    const config = {
      ...defaultNotifyConfig,
      autoClose: time || defaultNotifyConfig.autoClose,
    };
    return toast.success(text, config);
  };

  const notifyWarning = (text, desc = "", time) => {
    const config = {
      ...defaultNotifyConfig,
      autoClose: time || defaultNotifyConfig.autoClose,
    };
    return toast.warning(
      desc ? (
        <div>
          <strong>{text}</strong>
          <p>{desc}</p>
        </div>
      ) : (
        text
      ),
      config
    );
  };

  return (
    <MainContext.Provider
      value={{
        imageData,
        setImage,
        loading,
        setLoading,
        backdrop,
        setBackdrop,
        notifySuccess,
        notifyError,
        notifyWarning,
      }}
    >
      {children}
    </MainContext.Provider>
  );
}
