import lwc from "@lwc/rollup-plugin";
import replace from "@rollup/plugin-replace";

export default {
	input: "src/clientLWC/main.js",

	output: {
		dir: "dist",
		preserveModules: true,
		preserveModulesRoot: "src",
		format: "es",
	},

	plugins: [
		replace({
			"process.env.NODE_ENV": JSON.stringify("development"),
		}),
		lwc(),
	],
};
