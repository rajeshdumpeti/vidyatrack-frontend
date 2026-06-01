import { FeeManagementPage } from "./FeeManagementPage";

export function ManagementFeesPage(props: { initialTab?: "setup" | "record" | "ledger"; setupOnly?: boolean }) {
  return <FeeManagementPage roleMode="management" {...props} />;
}
