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
    const { name, label, type, value, setter, options = [] } = field;

    switch (type) {
      case "textarea":
        return (
          <textarea
            id={name}
            value={value}
            onChange={(e) => setter(e.target.value)}
            className="w-full border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            required
          />
        );
      case "select":
        return (
          <select
            id={name}
            value={value}
            onChange={(e) => setter(e.target.value)}
            className="w-full border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            required
          >
            <option value="">Select {label}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <input
            id={name}
            type="checkbox"
            checked={value}
            onChange={(e) => setter(e.target.checked)}
            className="w-full border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
          />
        );
      default:
        return (
          <input
            id={name}
            type={type}
            value={value}
            onChange={(e) => setter(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            required
          />
        );
    }
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="p-4 bg-white rounded fixed-left-13p inset-0 z-50 mx-auto  modal-width modal-height"
      >
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 id="modal-title" className="text-lg font-bold">
            {formTitle}
          </h2>
          <button
            onClick={onClose}
            className="text-red-500 outline-none focus:outline-none"
          >
            <RxCross2 className="w-5 h-5" />
          </button>
        </div>


        <form onSubmit={handleSubmit} className={`flex flex-wrap`}>
          {fields.map((field) => (
            <div
              key={field.name}
              className={`w-full lg:w-${field.col}/12 px-4 my-2 `}
            >
              {field.type === "checkbox" ? (
                <>
                  <label
                    htmlFor={field.name}
                    className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                  >
                    {field.label}
                  </label>
                  {renderField(field)}
                </>
              ) : (
                <>
                  <label
                    htmlFor={field.name}
                    className=" block uppercase text-blueGray-500 text-xs font-bold mb-2"
                  >
                    {field.label}
                  </label>
                  {renderField(field)}
                </>
              )}
            </div>
          ))}

          <div className="margin-dynamic-modal">
            <button
              type="submit"
              className="bg-lightBlue-500 items-center text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default DynamicFormModal;
