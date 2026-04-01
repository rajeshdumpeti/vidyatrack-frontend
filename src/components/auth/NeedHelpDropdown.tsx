import { useState, useRef, useEffect } from "react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";
import { HiPhone, HiMail } from "react-icons/hi";

export function NeedHelpDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-500 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors"
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] font-bold leading-none">
          ?
        </span>
        Need Help?
        {open ? (
          <HiChevronUp className="h-3.5 w-3.5" />
        ) : (
          <HiChevronDown className="h-3.5 w-3.5" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-gray-100 bg-white shadow-xl">
          {/* Trouble logging in */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Trouble Logging In?
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Wrong email or password? Contact your school management. They can
              reset your account.
            </p>
            <button
              type="button"
              className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Who is my school management?
            </button>
          </div>

          {/* Contact support */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              Contact Support
            </p>
            <a
              href="tel:+918686866818"
              className="flex items-center gap-2.5 rounded-xl bg-green-50 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
            >
              <HiPhone className="h-4 w-4 shrink-0 text-green-600" />
              <div>
                <p className="font-semibold">Call Us</p>
                <p className="text-green-600">+91 86868 66818 &bull; 9 AM–5 PM</p>
              </div>
            </a>
            <a
              href="mailto:dumpetirajesh123@gmail.com"
              className="mt-2 flex items-center gap-2.5 rounded-xl bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <HiMail className="h-4 w-4 shrink-0 text-blue-600" />
              <div>
                <p className="font-semibold">Email Us</p>
                <p className="text-blue-600">dumpetirajesh123@gmail.com &bull; 24hr response</p>
              </div>
            </a>
          </div>

          {/* Tip */}
          <div className="px-4 py-3">
            <p className="text-[11px] text-gray-400">
              <span className="mr-1">⏱</span>
              For fastest help, mention your role and school name.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
