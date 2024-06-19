import "dotenv/config";
import fs from "fs";
import UTIL from "./Util.js";
import OAUTH_JWT from "./OAuth_JWT.js";
import WEB_SERVER from "./WebServer.js";

const HTTP_PORT = process.env.PORT || 4000;
const HTTPS_PORT = Number(HTTP_PORT) + 1;

export default class OAuthDemo {
	static async Start() {
		const demo = new OAuthDemo();
		await demo.readConfigJSON();
		await demo.intializeServer();
	}

	async intializeServer() {
		const util = new UTIL();
		const oauthJWT = new OAUTH_JWT({ util });
		const webserver = new WEB_SERVER({ util });

		await webserver.initialize({ isLocalhost: process.env.SERVER === "Local", HTTPS_PORT });
		console.log("HELLO");
	}

	async readConfigJSON() {
		if (process.env.USER_JSON) {
			fs.promises
				.readFile(process.env.USER_JSON, "utf8")
				.then((txtData) => {
					let jsontData = JSON.parse(txtData);
					let userData = jsontData.user;
					process.env.OAUTH_UN = userData.username;
					process.env.OAUTH_PW = userData.password;
					process.env.OAUTH_LOGIN_URL = userData.instanceUrl;
					process.env.OAUTH_CONSUMER_KEY = userData.consumerKey;
					process.env.OAUTH_CONSUMER_SECRET = userData.consumerSecret;
				})
				.catch((err) => {
					console.error(`Error: ${err.message}`);
				});
		}
	}
}

OAuthDemo.Start();
