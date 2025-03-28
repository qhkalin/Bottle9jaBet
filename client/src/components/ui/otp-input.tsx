import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  length?: number;
  onChange: (otp: string) => void;
  className?: string;
  inputClassName?: string;
  value?: string;
  autoFocus?: boolean;
}

export function OtpInput({
  length = 6,
  onChange,
  className,
  inputClassName,
  value = "",
  autoFocus = false,
}: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(value.split("").slice(0, length).concat(Array(length).fill("")).slice(0, length));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);
  
  useEffect(() => {
    const newOtp = value.split("").slice(0, length).concat(Array(length).fill("")).slice(0, length);
    setOtp(newOtp);
  }, [value, length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (val === "" || /^[0-9]$/.test(val)) {
      const newOtp = [...otp];
      // Only taking the last character if multiple characters are pasted
      newOtp[index] = val.slice(-1);
      setOtp(newOtp);
      
      // Call onChange with the new OTP
      onChange(newOtp.join(""));
      
      // Move focus to next input if a digit was entered
      if (val !== "" && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Handle backspace and move focus to previous input
    if (e.key === "Backspace" && index > 0 && otp[index] === "") {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle left arrow key
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle right arrow key
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    
    // Only proceed if the pasted data contains numbers
    if (!/^\d+$/.test(pastedData)) return;
    
    const pastedChars = pastedData.split("").slice(0, length);
    const newOtp = [...Array(length).fill("")];
    
    pastedChars.forEach((char, idx) => {
      newOtp[idx] = char;
    });
    
    setOtp(newOtp);
    onChange(newOtp.join(""));
    
    // Focus the next empty input or the last input if full
    const nextEmptyIndex = newOtp.findIndex(val => val === "");
    if (nextEmptyIndex === -1) {
      inputRefs.current[length - 1]?.focus();
    } else {
      inputRefs.current[nextEmptyIndex]?.focus();
    }
  };

  return (
    <div className={cn("flex justify-between items-center gap-2", className)}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={el => inputRefs.current[index] = el}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={otp[index] || ""}
          onChange={e => handleChange(e, index)}
          onKeyDown={e => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className={cn(
            "w-12 h-12 text-center text-xl font-medium bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-primary text-foreground",
            inputClassName
          )}
        />
      ))}
    </div>
  );
}

export default OtpInput;
