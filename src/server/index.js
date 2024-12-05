import 'dotenv/config';
import fs from 'fs';
import UTIL from './Util.js';
import OAUTH_JWT from './OAuth_JWT.js';
import WEB_SERVER from './WebServer.js';

const HTTP_PORT = process.env.PORT || 4000;
const HTTPS_PORT = Number(HTTP_PORT) + 1;

export default class OAuthDemo {
	static async Start() {
		const demo = new OAuthDemo();
		await demo.intializeServer();
	}

	async intializeServer() {
		const util = new UTIL();
		new OAUTH_JWT({ util });
		const webserver = new WEB_SERVER({ util });

		await webserver.initialize({ isLocalhost: process.env.SERVER === 'Local', HTTPS_PORT });
	}
}

OAuthDemo.Start();
