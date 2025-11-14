import type { FC, HTMLInputTypeAttribute, ChangeEvent } from "react";

interface Props {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: HTMLInputTypeAttribute;
  required?: boolean;
  isTextarea?: boolean;
}

export const ProductFormInput: FC<Props> = (props) => {
  const { label, name, value, required, onChange, type, isTextarea } = props;
  const id = `${name}-id`;

  const InputOrTextarea = isTextarea ? "textarea" : "input";

  return (
    <label htmlFor={id} className="block">
      <span className="text-gray-700">{label}</span>
      <InputOrTextarea
        id={id}
        type={type || "text"}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
      />
    </label>
  );
};
