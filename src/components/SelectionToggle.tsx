export default function SelectionToggle({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`w-5 h-5 rounded-md border-2 transition-all duration-300 flex items-center justify-center cursor-pointer group/toggle relative overflow-hidden active:scale-90
        ${checked || indeterminate ? "bg-primary border-primary shadow-lg shadow-primary/20" : "border-outline-variant/60 hover:border-primary bg-transparent"}
      `}
    >
      {(checked || indeterminate) && (
        <div className="absolute inset-0 bg-white/20 animate-ping [animation-duration:1.5s]"></div>
      )}
      <span
        className={`material-symbols-outlined text-white text-[14px] font-black transition-all duration-300 transform relative z-10
        ${checked || indeterminate ? "scale-100 opacity-100" : "scale-0 opacity-0"}
      `}
      >
        {indeterminate ? "remove" : "check"}
      </span>
    </button>
  );
}
