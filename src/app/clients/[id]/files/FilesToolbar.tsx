"use client";

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string };

function ToolbarButton({ label, className = "", ...rest }: BtnProps) {
  // width chosen to fit the longest label (“Add Scanned Document”) comfortably
  const widthClass = "min-w-[14rem]"; // ~224px
  const base =
    "inline-flex items-center justify-center rounded-md border border-gray-300 " +
    "bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm " +
    "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 " +
    "disabled:opacity-50 disabled:cursor-not-allowed";
  return (
    <button className={`${base} ${widthClass} ${className}`} {...rest}>
      {label}
    </button>
  );
}

export default function FilesToolbar(props: {
  onAddScan?: () => void;
  onEditType?: () => void;
  onEditDesc?: () => void;
  onEditName?: () => void;
  onEditDate?: () => void;
  onRemove?: () => void;
  onAddFile?: () => void;
}) {
  const {
    onAddScan = () => {},
    onEditType = () => {},
    onEditDesc = () => {},
    onEditName = () => {},
    onEditDate = () => {},
    onRemove = () => {},
    onAddFile = () => {},
  } = props;

  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <ToolbarButton label="Add Scanned Document" onClick={onAddScan} />
      <ToolbarButton label="Edit File Type" onClick={onEditType} />
      <ToolbarButton label="Edit Description" onClick={onEditDesc} />
      <ToolbarButton label="Edit File Name" onClick={onEditName} />
      <ToolbarButton label="Edit Date" onClick={onEditDate} />
      <ToolbarButton label="Remove File" onClick={onRemove} className="border-red-300 text-red-700 hover:bg-red-50" />
      <ToolbarButton label="Add File" onClick={onAddFile} className="border-blue-500 bg-blue-600 text-white hover:bg-blue-700" />
    </div>
  );
}
