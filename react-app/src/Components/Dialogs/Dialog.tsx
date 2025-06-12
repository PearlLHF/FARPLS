import React, { memo } from "react";
import { X } from "react-feather";

interface DialogProps {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Dialog({ onClose, title, children }: DialogProps) {
  return (
    <div className="z-50 fixed top-0 left-0 h-screen w-screen bg-gray-200 dark:bg-gray-900 bg-opacity-70 dark:bg-opacity-75 backdrop-blur-[1px] flex justify-center items-center shadow-2xl transition-opacity duration-75">
      <div className="w-3/4 max-w-lg px-8 py-6 rounded shadow bg-slate-100 dark:bg-slate-800">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <X className="h-6 w-6 cursor-pointer" onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}

export default memo(Dialog);
