import "dotenv/config";
import UTIL from "./Util.js";
import OAUTH_JWT from "./OAuth_JWT.js";
import WEB_SERVER from "./WebServer.js";

const HTTP_PORT = process.env.PORT || 4000;
const HTTPS_PORT = Number(HTTP_PORT) + 1;

async function intializeServer() {
	const util = new UTIL();
	const oauthJWT = new OAUTH_JWT({ util });
	const webserver = new WEB_SERVER({ util });

	await webserver.initialize({ isLocalhost: process.env.SERVER === "Local", HTTPS_PORT });
	console.log("HELLO");
}

intializeServer();
