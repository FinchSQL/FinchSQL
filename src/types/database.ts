export interface ConnectionConfig {
  id?: string;
  name: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  error?: string;
}
