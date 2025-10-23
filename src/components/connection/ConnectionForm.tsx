import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Spinner } from "../ui/spinner";
import type { ConnectionConfig } from "../../types/database";
import { testConnection } from "../../services/tauri-api";

export function ConnectionForm() {
  const [config, setConfig] = useState<ConnectionConfig>({
    name: "Local PostgreSQL",
    host: "localhost",
    port: 5432,
    database: "postgres",
    username: "postgres",
    password: "",
    ssl: false,
  });

  const [testing, setTesting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    error?: string;
  } | null>(null);

  const handleInputChange = (
    field: keyof ConnectionConfig,
    value: string | number | boolean
  ) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setResult(null);

    try {
      const testResult = await testConnection(config);
      setResult(testResult);
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to test connection",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    setResult(null);

    try {
      // TODO: Implement actual connection logic
      // This should establish a persistent connection to the database
      const connectionResult = await testConnection(config); // Temporary placeholder
      setResult({
        ...connectionResult,
        message: connectionResult.success
          ? "Connected successfully!"
          : connectionResult.message,
      });
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to connect",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setConnecting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>PostgreSQL Connection</CardTitle>
        <CardDescription>
          Enter your PostgreSQL database credentials to connect
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Connection Name</Label>
          <Input
            id="name"
            value={config.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="My Database"
          />
        </div>

        {/* Host and Port */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="host">Host</Label>
            <Input
              id="host"
              value={config.host}
              onChange={(e) => handleInputChange("host", e.target.value)}
              placeholder="localhost"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              type="number"
              value={config.port}
              onChange={(e) =>
                handleInputChange("port", parseInt(e.target.value))
              }
              placeholder="5432"
            />
          </div>
        </div>

        {/* Database */}
        <div className="space-y-2">
          <Label htmlFor="database">Database</Label>
          <Input
            id="database"
            value={config.database}
            onChange={(e) => handleInputChange("database", e.target.value)}
            placeholder="postgres"
          />
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={config.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            placeholder="postgres"
            autoComplete="username"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={config.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
          />
        </div>

        {/* SSL */}
        <div className="flex items-center space-x-2">
          <Switch
            id="ssl"
            checked={config.ssl}
            onCheckedChange={(checked) => handleInputChange("ssl", checked)}
          />
          <Label htmlFor="ssl">Use SSL</Label>
        </div>

        {/* Connection Buttons */}
        <div className="flex gap-2 p-1">
          <Button
            onClick={handleTestConnection}
            disabled={testing || connecting}
            variant="outline"
            className="flex-1 cursor-pointer"
          >
            {testing && <Spinner className="mr-2" />}
            {testing ? "Testing..." : "Test Connection"}
          </Button>
          <Button
            onClick={handleConnect}
            disabled={connecting || testing}
            className="flex-1 cursor-pointer"
          >
            {connecting && <Spinner className="mr-2" />}
            {connecting ? "Connecting..." : "Connect"}
          </Button>
        </div>

        {/* Result Alert */}
        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            <AlertTitle>
              {result.success ? "Success" : "Connection Failed"}
            </AlertTitle>
            <AlertDescription>
              {result.message}
              {result.error && (
                <div className="mt-2 text-sm font-mono bg-muted p-2 rounded">
                  {result.error}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
