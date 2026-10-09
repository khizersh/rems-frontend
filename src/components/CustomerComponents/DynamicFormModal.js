import React from "react";
import { RxCross2 } from "react-icons/rx";

const DynamicFormModal = ({
  isOpen,
  onClose,
  formTitle = "Form",
  fields = [],
  onSubmit,
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(); // parent handles the collected data
  };

  const renderField = (field) => {
    const { name, label, type, value, setter, options = [], error } = field;

    switch (type) {
      case "textarea":
        return (
          <>
            <textarea
              id={name}
              value={value}
              onChange={(e) => setter(e.target.value)}
              className={`w-full border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${error ? "border border-red-500" : ""}`}
              required
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </>
        );
      case "select":
        return (
          <>
            <select
              id={name}
              value={value}
              onChange={(e) => setter(e.target.value)}
              className={`w-full border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150 ${error ? "border border-red-500" : ""}`}
              required
            >
              <option value="">Select {label}</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </>
        );
      case "checkbox":
        return (
          <>
            <input
              id={name}
              type="checkbox"
              checked={value}
              onChange={(e) => setter(e.target.checked)}
              className="w-full border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </>
        );
      default:
        return (
          <>
            <input
              id={name}
              type={type}
              value={value}
              onChange={(e) => setter(e.target.value)}
              className={`w-full border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring ease-linear transition-all duration-150 ${error ? "border border-red-500" : ""}`}
              required
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </>
        );
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      {/* Modal Container */}
      <div className="fixed inset-0 z-50 overflow-y-auto px-4 py-6">
        <div className="flex min-h-full items-start justify-center sm:items-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-lightBlue-500 px-6 py-4 flex justify-between items-center">
            <h2 id="modal-title" className="text-lg font-bold text-white uppercase">
              {formTitle}
            </h2>
            <button
              onClick={onClose}
              className="text-white outline-none focus:outline-none"
            >
              <RxCross2 className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex flex-wrap p-2 max-h-[calc(90vh-74px)] overflow-y-auto">
            {fields.map((field) => (
              <div
                key={field.name}
                className={`w-full lg:w-${field.col}/12 px-4 my-2`}
              >
                <label
                  htmlFor={field.name}
                  className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                >
                  {field.label}
                </label>
                {renderField(field)}
              </div>
            ))}

            <div className="w-full px-4 mt-4 mb-2">
              <button
                type="submit"
                className="bg-lightBlue-500 items-center text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>
    </>
  );
};

export default DynamicFormModal;
