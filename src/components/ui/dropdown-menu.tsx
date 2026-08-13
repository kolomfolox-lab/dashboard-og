"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";

type DropdownMenuProps = {
  options: {
    label: string;
    onClick: () => void;
    Icon?: React.ReactNode;
  }[];
  children: React.ReactNode;
  className?: string;
};

const DropdownMenu = ({ options, children, className }: DropdownMenuProps) => {
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen((current) => !current)}
        className={`px-4 py-2 !bg-[#11111198] hover:!bg-[#111111d1] shadow-[0_0_20px_rgba(0,0,0,0.2)] border-none rounded-xl backdrop-blur-sm ${className || ''}`}
      >
        {children ?? t('dropdownMenu_menu', 'Menu')}
        <motion.span
          className="ml-2"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut", type: "spring" }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: -5, scale: 0.95, filter: "blur(10px)" }}
            animate={{ y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ y: -5, scale: 0.95, opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: "circInOut", type: "spring" }}
            className="absolute right-0 z-10 mt-2 flex w-48 flex-col gap-2 rounded-xl bg-[#11111198] p-1 shadow-[0_0_20px_rgba(0,0,0,0.2)] backdrop-blur-sm"
          >
            {options.length > 0 ? (
              options.map((option, index) => (
                <motion.button
                  key={option.label}
                  initial={{ opacity: 0, x: 10, scale: 0.95, filter: "blur(10px)" }}
                  animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: 10, scale: 0.95, filter: "blur(10px)" }}
                  transition={{ duration: 0.4, delay: index * 0.1, ease: "easeInOut", type: "spring" }}
                  whileHover={{ backgroundColor: "#11111140", transition: { duration: 0.4, ease: "easeInOut" } }}
                  whileTap={{ scale: 0.95, transition: { duration: 0.2, ease: "easeInOut" } }}
                  onClick={() => {
                    option.onClick();
                    setIsOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-x-2 rounded-lg px-2 py-3 text-left text-sm text-white"
                >
                  {option.Icon}
                  {option.label}
                </motion.button>
              ))
            ) : (
              <div className="px-4 py-2 text-xs text-white">{t('dropdownMenu_no_options', 'No options')}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { DropdownMenu };
