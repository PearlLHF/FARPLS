import { memo } from "react";
import Dialog from "./Dialog";

interface MessageDialogProps {
  onClose: () => void;
  text: string;
}
function MessageDialog({ onClose, text }: MessageDialogProps) {
  return (
    <Dialog onClose={onClose} title="Message">
      <div className="flex flex-col gap-4 ">
        {text.split("\n").map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    </Dialog>
  );
}

export default memo(MessageDialog);
