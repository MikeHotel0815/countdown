module.exports = {
  apps: [
    {
      name: "spielplatzpeter",
      script: "npm", // Use npm to run the start script
      args: "run start", // Specify the "start" script
      env: {
        PORT: 4001, // Set the port to 4001
        NODE_ENV: "production", // Set the environment to production
      },
      watch: true, // Watch for changes and restart
      ignore_watch: ["node_modules", "build"], // Ignore changes in these folders
      interpreter: "none", // No need for a specific interpreter, npm handles it
    },
  ],
};
