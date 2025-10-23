use crate::models::connection::{ConnectionConfig, ConnectionTestResult};
use sqlx::postgres::PgPoolOptions;

#[tauri::command]
pub async fn test_connection(config: ConnectionConfig) -> Result<ConnectionTestResult, String> {
    // Build connection string
    let connection_string = format!(
        "postgres://{}:{}@{}:{}/{}{}",
        config.username,
        config.password,
        config.host,
        config.port,
        config.database,
        if config.ssl { "?sslmode=require" } else { "" }
    );

    // Attempt to connect
    match PgPoolOptions::new()
        .max_connections(1)
        .connect(&connection_string)
        .await
    {
        Ok(pool) => {
            // Test the connection by running a simple query
            match sqlx::query("SELECT 1")
                .execute(&pool)
                .await
            {
                Ok(_) => {
                    pool.close().await;
                    Ok(ConnectionTestResult {
                        success: true,
                        message: "Connection successful!".to_string(),
                        error: None,
                    })
                }
                Err(e) => {
                    pool.close().await;
                    Ok(ConnectionTestResult {
                        success: false,
                        message: "Failed to execute test query".to_string(),
                        error: Some(e.to_string()),
                    })
                }
            }
        }
        Err(e) => Ok(ConnectionTestResult {
            success: false,
            message: "Failed to connect to database".to_string(),
            error: Some(e.to_string()),
        }),
    }
}
