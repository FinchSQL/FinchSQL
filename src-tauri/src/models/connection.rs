use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectionConfig {
    pub id: Option<String>,
    pub name: String,
    pub host: String,
    pub port: u16,
    pub database: String,
    pub username: String,
    pub password: String,
    pub ssl: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConnectionTestResult {
    pub success: bool,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}
