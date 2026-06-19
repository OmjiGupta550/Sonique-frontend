import React from "react";

export function Slider({
  value,
  max,
  onChange,
  className = "",
  accentColor = "#8B5CF6",
}) {
  const percent = max > 0 ? (value / max) * 100 : 0;

  const handleChange = (e) => {
    onChange(parseFloat(e.target.value));
  };

  return (
    <div
      className={`group relative flex items-center w-full h-5 select-none touch-none ${className}`}
    >
      <input
        type="range"
        min={0}
        max={max || 100}
        step="any"
        value={value}
        onChange={handleChange}
        style={{
          background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${percent}%, rgba(255,255,255,0.1) ${percent}%, rgba(255,255,255,0.1) 100%)`,
        }}
        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer outline-none focus:outline-none transition-all
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:h-0 
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
          [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-all
          group-hover:[&::-webkit-slider-thumb]:w-3 group-hover:[&::-webkit-slider-thumb]:h-3"
      />
    </div>
  );
}
