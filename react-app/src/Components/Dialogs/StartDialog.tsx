import { memo, useState } from "react";
import Dialog from "./Dialog";
import { getLogger } from "../../logger";
interface StartDialogProps {
  onClose: () => void;
  onStart: (userId: string, systemType: string) => void;
  logger: ReturnType<typeof getLogger>;
}

function StartDialog({ onClose, onStart, logger }: StartDialogProps) {
  const [userId, setUserId] = useState("");
  const [systemType, setSystemType] = useState("baseline");
  const [error, setError] = useState("");

  const handleStart = () => {
    if (userId.trim() === "") {
      setError("User ID is required");
    } else {
      const lastTwoDigits = parseInt(userId.slice(-1), 10);
      if (userId === "test") {
        onStart(userId, systemType);
      } else if (isNaN(lastTwoDigits)) {
        setError("Invalid User ID");
        logger.warn(`Invalid User ID: ${userId}`);
      } else if (lastTwoDigits % 2 !== 0 && systemType === "experiment") {
        setError("Invalid UID for selected system");
        logger.warn(`Invalid UID for selected system: ${userId}`);
      } else if (lastTwoDigits % 2 === 0 && systemType === "baseline") {
        setError("Invalid UID for selected system");
        logger.warn(`Invalid UID for selected system: ${userId}`);
      } else {
        onStart(userId, systemType);
        logger.info(`User ID started: ${userId}`);
      }
    }
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
    setError("");
  };

  return (
    <Dialog onClose={onClose} title="Welcome!">
      <div className="flex flex-col gap-4 ">
        <label htmlFor="userId" className="font-medium">
          User ID:
        </label>
        <input
          type="text"
          id="userId"
          value={userId}
          onChange={handleUserIdChange}
          className="shadow-2xl px-4 py-2 rounded border border-transparent text-lg font-medium bg-slate-400 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="text-red-500">{error}</p>}

        <label htmlFor="systemType" className="font-medium">
          System Type:
        </label>
        <select
          id="systemType"
          value={systemType}
          onChange={(e) => setSystemType(e.target.value)}
          className="shadow-lg appearance-none px-4 py-2 rounded text-lg font-medium bg-slate-400 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            fontFamily: "Arial",
            appearance: "none",
          }}
        >
          <option value="baseline">Group 1</option>
          <option value="experiment">Group 2</option>
        </select>

        <button
          onClick={handleStart}
          className="shadow-2xl px-4 py-2 rounded border border-transparent text-lg font-medium bg-slate-400 dark:bg-gray-900 hover:bg-slate-500 transition-all"
        >
          Start
        </button>
      </div>
    </Dialog>
  );
}

export default memo(StartDialog);
