const config = {
    env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "3000"),
    debug: process.env.APP_DEBUG === "true",
    logLevel: process.env.LOG_LEVEL || "info",
  };
  
  export default config;