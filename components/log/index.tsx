import { useLogs } from "@/lib/swr-hooks";
import { LogObject } from "@/lib/types";
import ListLog from "./list-log";

export default function LogScreen() {
  const { logs, isLogsLoading } = useLogs();

  return (
    <div className="h-menu overflow-y-scroll px-2 bg-yellow-200">
      <div className="text-xl font-bold mt-4 mb-2">Logs</div>
      {isLogsLoading ? (
        <div className="w-full flex h-full">
          <div className="loading-icon" />
        </div>
      ) : (
        (logs || []).map((log: LogObject) => (
          <ListLog log={log} key={log?.id} />
        ))
      )}
    </div>
  );
}
