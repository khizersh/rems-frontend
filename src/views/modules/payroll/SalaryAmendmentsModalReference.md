# Salary Amendments Modal Reference

Use this as the baseline style/pattern when creating new modals.

## Layout Pattern
- Render modal conditionally with `showModal`.
- Use a backdrop layer:
  - `fixed inset-0 z-40 bg-black bg-opacity-30`
  - Clicking backdrop closes modal and resets form.
- Use centered modal container with UnitList positioning classes:
  - `p-4 bg-white rounded modal-height-add-unit inset-0 z-50 mx-auto fixed-unit-position modal-height border border-gray-200 shadow-lg`

## Header Pattern
- Top bar:
  - `flex items-center justify-between mb-4 p-4 bg-lightBlue-500 rounded-t`
- Title is uppercase with left icon.
- Right close icon button (`RxCross2`) closes and resets.

## Form Body Pattern
- Scrollable body:
  - `max-h-[calc(83vh-96px)] overflow-y-auto p-2 payback-form`
- Build form in gray section cards:
  - `mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4`
- Section title row:
  - `mb-4 border-b border-gray-200 pb-2 text-sm font-bold text-gray-700 flex items-center`

## Field Theme (AddEmployee style)
- Shared field class:
  - `w-full p-2 border rounded-lg text-sm bg-white`
- Labels:
  - `mb-1 block text-xs font-medium text-gray-700`
- Required star:
  - `<span className="text-red-500">*</span>`

## Footer Actions
- Footer row:
  - `mt-6 flex justify-end border-t border-gray-200 pt-4`
- Cancel button:
  - gray, icon + text, closes and resets.
- Submit button:
  - `bg-lightBlue-500`, icon + text, supports loading state.

## UX Behavior
- `openCreate`: reset form then open modal.
- `openEdit`: populate fields then open modal.
- Close behavior always calls `setShowModal(false)` + `resetForm()`.
- Submit via form `onSubmit`, prevent default, then call async submit handler.
