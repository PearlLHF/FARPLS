import { resetPreferences } from "../../api";
import { downloadLogs } from "../../logger";
import Dialog from "./Dialog";
import { getLogger } from "../../logger";
import { memo } from "react";

interface SettingsDialogProps {
  onClose: () => void;
  user: string;
  systemType: string;
  logger: ReturnType<typeof getLogger>;
}

function SettingsDialog({
  onClose,
  user,
  systemType,
  logger,
}: SettingsDialogProps) {
  const handleResetPreferences = () => {
    resetPreferences(user, systemType);
    logger.info(`Preferences reset: ${user}`);
  };

  return (
    <Dialog onClose={onClose} title="Settings">
      <div className="flex flex-col gap-4 text-black dark:text-white">
        <button
          onClick={downloadLogs}
          className="shadow-2xl px-4 py-2 rounded border border-transparent text-lg font-medium bg-slate-400 hover:bg-slate-100 dark:bg-gray-900 dark:hover:bg-slate-500 transition-all"
        >
          Download Logs
        </button>
        <button
          onClick={handleResetPreferences}
          className="shadow-2xl px-4 py-2 rounded border border-transparent text-lg font-medium bg-slate-400 hover:bg-slate-100 dark:bg-gray-900 dark:hover:bg-slate-500 transition-all"
        >
          Reset Preferences
        </button>
      </div>
    </Dialog>
  );
}

export default memo(SettingsDialog);
