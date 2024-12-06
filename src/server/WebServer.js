import fs from 'fs';
import ejs from 'ejs';
import cors from 'cors';
import path from 'path';
import https from 'https';
import qs from 'querystring';
import express from 'express';
import cookieParser from 'cookie-parser';

export default class WebServer {
	app = null;
	util = null;
	redis = null;
	config = null;
	workQueue = null;
	lwcFolder = './dist';

	constructor({ util }) {
		this.util = util;
		this.util.webserver = this;
	}

	initialize(config) {
		console.log(JSON.stringify(config));
		this.util.logInfo({ message: 'Creating Web server...' });
		this.config = config;
		this.app = express();
		this.app.set('view engine', 'ejs');
		this.app.set('views', path.resolve('src/views'));

		this.makeServer();
		this.app.use(express.json());
		this.app.use(cors(this._CORS()));
		this.app.use(cookieParser());

		this.app.use(express.static(path.resolve(this.lwcFolder)));
		this.app.use(express.static(path.resolve('./src')));
		this.createRoutes();
		this.util.logInfo({ message: `HTTPS web server fully configured (${this.lwcFolder})` });
	}

	createRoutes() {
		this.app.get('/', this.renderLWC.bind(this));
		this.app.get('/jwt', this.oauthJWT.bind(this));
		this.app.get('/home', this.renderLWC.bind(this));
		this.app.post('/proxy', this.proxy.bind(this));
		this.app.post('/getUser', this.getUser.bind(this));
		this.app.get('/callback', this.callback.bind(this));
		this.app.get('/settings', this.getSettings.bind(this));
	}

	async proxy(req, res) {
		const bodyProxy = req.body;

		let request = {
			method: bodyProxy.method,
			url: bodyProxy.url,
			postData: qs.stringify(bodyProxy.body),
		};
		if (bodyProxy.headers) {
			request.headers = bodyProxy.headers;
		}
		this.util
			.makeCallout(request)
			.then((response) => {
				res.send(response.body);
			})
			.catch((err) => {
				res.status(500).send(err);
			});
	}

	async renderLWC(req, res) {
		res.sendFile(path.resolve(this.lwcFolder, 'index.html'));
	}

	async callback(req, res) {
		const userData = this.getUserDataFromCookie({ req, res });

		let code = req.query.code;
		if (code) {
			let request = {
				method: `POST`,
				url: `${userData.LOGIN_URL.value}/services/oauth2/token`,
				contentType: `FORM`,
				postData: qs.stringify({
					grant_type: `authorization_code`,
					code,
					client_id: userData.CONSUMER_KEY.value,
					client_secret: userData.CONSUMER_SECRET.value,
					redirect_uri: userData.CALLBACK.value,
				}),
			};
			this.util
				.makeCallout(request)
				.then((response) => {
					res.render('WebServerCallback', { data: JSON.stringify(response.body, null, 2) });
				})
				.catch((err) => {
					this.util.logError({ message: 'Error obtaining Access Token', value: err });
					res.render('WebServerCallback', { data: JSON.stringify(err, null, 2) });
				});
		} else {
			res.render('UserAgentCallback', { data: 'NOTHING' });
		}
	}

	async oauthJWT(req, res) {
		const userData = this.getUserDataFromCookie({ req, res });

		let privateKey = null;
		if (this.config.isLocalhost) {
			privateKey = fs.readFileSync(path.resolve('./cert', 'private.key')).toString('utf8');
		} else {
			privateKey = process.env.JWT_PRIVATE_JEY;
		}
		privateKey = privateKey.trim();
		let data = await this.util.oauthJWT.authorize({
			clientId: userData.CONSUMER_KEY.value,
			username: userData.UN.value,
			audience: userData.LOGIN_URL.value,
			privateKey,
		});
		res.json(data);
	}

	async getUser(req, res) {
		let data = req.body;
		this.util
			.makeCallout({ method: 'GET', url: data.id, authorization: `Bearer ${data.access_token}` })
			.then((results) => res.json(results))
			.catch((err) => res.json(err));
	}

	async getSettings(req, res) {
		const userData = this.getUserDataFromCookie({ req, res, canBeEmpty: true });
		let output = {};
		if (Object.keys(userData).length > 0) {
			const protocol = req.protocol; // 'http' or 'https'
			const host = req.get('host'); // e.g., 'example.com' or 'localhost:3000'
			const callbackURL = `${protocol}://${host}/callback`;

			output = {
				UN: { label: 'Username', value: userData.UN.value },
				PW: { label: 'Password', value: userData.PW.value },
				LOGIN_URL: { label: 'Login Url', value: userData.LOGIN_URL.value },
				CONSUMER_KEY: { label: 'Consumer Key', value: userData.CONSUMER_KEY.value },
				CONSUMER_SECRET: { label: 'Consumer Secret', value: userData.CONSUMER_SECRET.value },
				MY_DOMAIN: { label: 'My Domain', value: userData.MY_DOMAIN.value },
				// SECURITY_TOKEN: { label: "Security Token", value: userData.SECURITY_TOKEN.value },
				CALLBACK: { label: 'Callback', value: callbackURL },
			};
		}
		res.status(200).json(output);
	}

	getUserDataFromCookie({ req, res, canBeEmpty = false }) {
		let userData = req.cookies.userData;
		if (userData) {
			userData = JSON.parse(userData);
		} else {
			if (canBeEmpty) {
				userData = {};
			} else {
				throw 'No cookie found!';
			}
		}
		return userData;
	}

	// #region WEB SERVER
	_CORS() {
		return {
			origin: (origin, callback, ...other) => {
				// if (origin) {
				//     if (origin.endsWith(".lightning.force.com")) {
				//         // Any salesforce org, which is not cool
				//         callback(null, true);
				//     } else if (origin.endsWith(".herokuapp.com")) {
				//         // This is any heroku app, which is not cool!
				//         callback(null, true);
				//     } else if (origin.endsWith("localhost")) {
				//         callback(null, true);
				//     } else {
				//         callback(new Error('Not allowed by CORS'));
				//     }
				// } else {
				//     // No CORS requested, just accept it :-)
				//     callback(null, true);
				// }
				//Accept whatever!
				callback(null, true);
			},
			methods: ['GET', 'POST'],
		};
	}

	makeServer() {
		if (this.config.isLocalhost) {
			const serverHTTPS = https.createServer(
				{
					key: fs.readFileSync(path.resolve('./cert', 'private.key')),
					cert: fs.readFileSync(path.resolve('./cert', 'public.crt')),
				},
				this.app
			);
			serverHTTPS.listen(this.config.HTTPS_PORT, () => {
				// Keep this icon, so not doing a this.util.logInfo
				console.log(`✅ HTTPS web server initialized: https://localhost:${this.config.HTTPS_PORT}/`);
			});
		} else {
			console.log(`Starting Heroku server on port: ${process.env.PORT}`);
			this.app.listen(process.env.PORT, () => console.log(`✅   - Heroku server created`));
		}
	}
	// #endregion WEB SERVER
}
