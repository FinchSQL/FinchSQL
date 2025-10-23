import { ConnectionForm } from "../components/connection/ConnectionForm";

export function Home() {
  return (
    <div className="flex flex-1 bg-gray-200 h-screen overflow-hidden items-center justify-center">
      <ConnectionForm />
    </div>
  );
}
