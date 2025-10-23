import { invoke } from "@tauri-apps/api/core";
import type { ConnectionConfig, ConnectionTestResult } from "../types/database";

export async function testConnection(
  config: ConnectionConfig
): Promise<ConnectionTestResult> {
  try {
    const result = await invoke<ConnectionTestResult>("test_connection", {
      config,
    });
    return result;
  } catch (error) {
    return {
      success: false,
      message: "Failed to test connection",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
