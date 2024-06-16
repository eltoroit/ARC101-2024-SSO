import "dotenv/config";
import lwc from "@lwc/rollup-plugin";
import replace from "@rollup/plugin-replace";

const config = {
	input: "src/clientLWC/main.js",
	output: {},

	plugins: [
		replace({
			preventAssignment: true,
			"process.env.NODE_ENV": JSON.stringify("development"),
		}),
		lwc(),
	],
};

const debugMode = process.env.COMPILE === "DEV";
if (debugMode) {
	console.log("DEBUGGING Mode (Separate files for LWC)");
	// Separate modules, good for debugging
	config.output = {
		dir: "dist",
		preserveModules: true,
		preserveModulesRoot: "src",
		format: "es",
	};
} else {
	console.log("PRODUCTION Mode (Single files for LWC)");
	// Good for production
	config.output = {
		file: "dist/clientLWC/main.js",
		format: "es",
	};
}

export default config;
