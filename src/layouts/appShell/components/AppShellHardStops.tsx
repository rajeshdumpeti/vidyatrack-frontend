import {
  AlertTriangle,
  Clock,
  CreditCard,
  ServerCrash,
  ShieldAlert,
  UserX,
  WifiOff,
  Wrench,
} from "lucide-react";

import { HardStop } from "@/components/feedback/HardStop";
import type { HardStopReason } from "@/store/hardStop.store";

type AppShellHardStopsProps = {
  hardStopReason: HardStopReason | null;
  hardStopDetail: string | null;
  shouldShowIdleModal: boolean;
  idleSecondsLeft: number;
  onClearOffline: () => void;
  onLogout: () => void;
  onRefresh: () => void;
  onContactSupport: () => void;
  onStaySignedIn: () => void;
};

export function AppShellHardStops({
  hardStopReason,
  hardStopDetail,
  shouldShowIdleModal,
  idleSecondsLeft,
  onClearOffline,
  onLogout,
  onRefresh,
  onContactSupport,
  onStaySignedIn,
}: AppShellHardStopsProps) {
  return (
    <>
      {hardStopReason ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
          {hardStopReason === "offline" ? (
            <HardStop
              tone="warning"
              icon={<WifiOff className="h-5 w-5" />}
              title="You're offline"
              description="No internet connection detected. Check your network and try again."
              primaryAction={{ label: "Retry", onClick: onClearOffline }}
              secondaryAction={{ label: "Logout", onClick: onLogout }}
            />
          ) : null}
          {hardStopReason === "service_down" ? (
            <HardStop
              tone="warning"
              icon={<ServerCrash className="h-5 w-5" />}
              title="Service temporarily unavailable"
              description="We're having trouble reaching VidyaTrack services. Please try again in a few minutes."
              primaryAction={{ label: "Retry", onClick: onRefresh }}
              secondaryAction={{ label: "Logout", onClick: onLogout }}
            />
          ) : null}
          {hardStopReason === "maintenance" ? (
            <HardStop
              tone="info"
              icon={<Wrench className="h-5 w-5" />}
              title="Maintenance in progress"
              description="VidyaTrack is updating right now. Please check back shortly."
              primaryAction={{ label: "Refresh", onClick: onRefresh }}
              secondaryAction={{ label: "Logout", onClick: onLogout }}
            />
          ) : null}
          {hardStopReason === "subscription_expired" ? (
            <HardStop
              tone="danger"
              icon={<CreditCard className="h-5 w-5" />}
              title="Subscription expired"
              description="Your school's subscription is inactive. Please contact the administrator to renew access."
              primaryAction={{ label: "Contact Support", onClick: onContactSupport }}
              secondaryAction={{ label: "Logout", onClick: onLogout }}
            />
          ) : null}
          {hardStopReason === "inactive_user" ? (
            <HardStop
              tone="danger"
              icon={<UserX className="h-5 w-5" />}
              title="Account inactive"
              description="Your account has been disabled. Please contact your administrator."
              primaryAction={{ label: "Logout", onClick: onLogout }}
            />
          ) : null}
          {hardStopReason === "no_school_access" ? (
            <HardStop
              tone="warning"
              icon={<ShieldAlert className="h-5 w-5" />}
              title="No school access"
              description="Your account isn't linked to a school yet. Ask your admin to add you."
              primaryAction={{ label: "Logout", onClick: onLogout }}
            />
          ) : null}
          {hardStopReason === "unknown_error" ? (
            <HardStop
              tone="warning"
              icon={<AlertTriangle className="h-5 w-5" />}
              title="Something went wrong"
              description={hardStopDetail ?? "Please try again."}
              primaryAction={{ label: "Refresh", onClick: onRefresh }}
              secondaryAction={{ label: "Logout", onClick: onLogout }}
            />
          ) : null}
        </div>
      ) : null}

      {!hardStopReason && shouldShowIdleModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
          <HardStop
            tone="warning"
            icon={<Clock className="h-5 w-5" />}
            title="You're about to be signed out"
            description={`For your security, we sign out after inactivity. You will be logged out in ${Math.floor(
              idleSecondsLeft / 60,
            )
              .toString()
              .padStart(2, "0")}:${(idleSecondsLeft % 60)
              .toString()
              .padStart(2, "0")}.`}
            primaryAction={{ label: "Stay Signed In", onClick: onStaySignedIn }}
            secondaryAction={{ label: "Logout Now", onClick: onLogout }}
          />
        </div>
      ) : null}
    </>
  );
}
