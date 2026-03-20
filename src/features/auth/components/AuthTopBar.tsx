import { BrandMark } from "@/components/brand/BrandMark";
import { HelpCircle, Mail, Phone, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type AuthTopBarProps = {
  onCallSupport?: () => void;
  onEmailSupport?: () => void;
  onTroubleLoggingIn?: () => void;
};

export function AuthTopBar({
  onCallSupport,
  onEmailSupport,
  onTroubleLoggingIn,
}: AuthTopBarProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsHelpOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmail = () => {
    const subject = encodeURIComponent("Need Help with VidyaTrack");
    const body = encodeURIComponent(
      `Hello VidyaTrack Support,\n\n` +
        `I need assistance with:\n` +
        `- Role: \n` +
        `- Issue: \n\n` +
        `Please help.\n\n` +
        `Thanks`,
    );
    window.location.href = `mailto:dumpetirajesh123@gmail.com?subject=${subject}&body=${body}`;
    onEmailSupport?.();
    setIsHelpOpen(false);
  };

  const handleCall = () => {
    window.location.href = "tel:+919876543210";
    onCallSupport?.();
    setIsHelpOpen(false);
  };

  const handleTroubleLoggingIn = () => {
    onTroubleLoggingIn?.();
    setIsHelpOpen(false);
  };

  return (
    <header className="flex items-center justify-between px-8 py-5">
      <div className="flex items-center gap-3">
        <BrandMark />
      </div>

      {/* Help Menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsHelpOpen(!isHelpOpen)}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Help menu"
          aria-expanded={isHelpOpen}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Need Help?</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${isHelpOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isHelpOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
            {/* Login Help Section */}
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Trouble Logging In?
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Wrong email or password? Contact your school management. They
                can reset your account.
              </p>
              <button
                onClick={handleTroubleLoggingIn}
                className="text-xs text-blue-600 hover:underline"
              >
                Who is my school management?
              </button>
            </div>

            {/* Contact Options */}
            <div className="p-3 space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 px-2">
                Contact Support
              </h3>

              {/* Phone Option */}
              <button
                onClick={handleCall}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 group-hover:bg-green-100">
                  <Phone className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Call Us</p>
                  <p className="text-xs text-gray-500">
                    +91 86868 66818 • 9 AM - 5 PM
                  </p>
                </div>
              </button>

              {/* Email Option */}
              <button
                onClick={handleEmail}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 group-hover:bg-blue-100">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Email Us</p>
                  <p className="text-xs text-gray-500">
                    dumpetirajesh123@gmail.com • 24hr response
                  </p>
                </div>
              </button>
            </div>

            {/* Quick Tip */}
            <div className="bg-gray-50 px-4 py-3 rounded-b-lg">
              <p className="text-xs text-gray-500">
                ⏱️ For fastest help, mention your role and school name
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
