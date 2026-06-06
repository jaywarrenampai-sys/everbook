interface Props {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-3",
  lg: "w-14 h-14 border-4",
};

export default function Spinner({ size = "md", className = "" }: Props) {
  return (
    <div
      className={`
        rounded-full border-amber-200 border-t-amber-600 animate-spin
        ${SIZES[size]} ${className}
      `}
      style={{ borderStyle: "solid" }}
      role="status"
      aria-label="กำลังโหลด"
    />
  );
}
