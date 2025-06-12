import log, { LogLevelDesc } from "loglevel";

export function getLogger() {
  const level = localStorage.getItem("loglevel:cerberus") || "info";
  log.setLevel(level as LogLevelDesc);

  const originalFactory = log.methodFactory;

  log.methodFactory = function (methodName, logLevel, loggerName) {
    const originalMethod = originalFactory(methodName, logLevel, loggerName);

    return function (message: string) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] ${message}`;

      saveLog(logMessage);
      originalMethod(logMessage);
    };
  };

  return log.getLogger("cerberus");
}

function saveLog(logMessage: string) {
  const logs = localStorage.getItem("logs") || "";
  localStorage.setItem("logs", logs + logMessage + "\n");
}

export function downloadLogs() {
  const logs = localStorage.getItem("logs") || "";

  // Create a Blob containing the logs
  const blob = new Blob([logs], { type: "text/plain" });

  // Create a download link
  const downloadLink = document.createElement("a");
  downloadLink.download = "logs.txt";
  downloadLink.href = window.URL.createObjectURL(blob);
  downloadLink.style.display = "none";

  // Append the download link to the document body
  document.body.appendChild(downloadLink);

  // Simulate a click on the download link to trigger the download
  downloadLink.click();

  // Clean up by removing the download link
  document.body.removeChild(downloadLink);
}

export function resetLogs() {
  localStorage.removeItem("logs");
}