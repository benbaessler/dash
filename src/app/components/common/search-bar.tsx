import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export const SearchBar = ({
  value,
  onChange,
  placeholder = "Search",
  maxLength = 255,
  className = "",
}: Props) => {
  return (
    <div className={`relative ${className}`}>
      <MagnifyingGlassIcon
        weight="bold"
        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        className="w-full rounded pl-9"
      />
    </div>
  );
};
