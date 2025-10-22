#!/usr/bin/env node

/**
 * Simple script to toggle debug mode in the .env file
 * Usage: node scripts/toggle-debug.js [on|off]
 */

const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");

// Read current .env file
let envContent = "";
try {
	envContent = fs.readFileSync(envPath, "utf8");
} catch (error) {
	console.error("Error reading .env file:", error.message);
	process.exit(1);
}

// Get command line argument
const command = process.argv[2];

if (!command || !["on", "off"].includes(command)) {
	console.log("Usage: node scripts/toggle-debug.js [on|off]");
	console.log(
		"Current debug mode:",
		envContent.includes("VITE_DEBUG_MODE=true") ? "ON" : "OFF"
	);
	process.exit(0);
}

// Toggle debug mode
const newValue = command === "on" ? "true" : "false";

if (envContent.includes("VITE_DEBUG_MODE=")) {
	// Replace existing value
	envContent = envContent.replace(
		/VITE_DEBUG_MODE=(true|false)/,
		`VITE_DEBUG_MODE=${newValue}`
	);
} else {
	// Add new line
	envContent += `\nVITE_DEBUG_MODE=${newValue}`;
}

// Write back to file
try {
	fs.writeFileSync(envPath, envContent);
	console.log(`✅ Debug mode turned ${command.toUpperCase()}`);
	console.log("🔄 Restart the extension to see changes");
} catch (error) {
	console.error("Error writing .env file:", error.message);
	process.exit(1);
}
