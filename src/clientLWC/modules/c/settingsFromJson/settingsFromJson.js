import { LightningElement, api } from 'lwc';

export default class Home extends LightningElement {
	_settings = {};
	callbackURL = '';

	@api
	get settings() {
		return this._settings;
	}
	set settings(value) {
		if (value.CALLBACK) {
			this._settings = JSON.parse(JSON.stringify(value));
			if (!value.UN.value) {
				// If we do not have valid values (Username) then read form cookie
				this.readCookie();
			}
			this.callbackURL = this._settings.CALLBACK.value;
		}
	}

	onCallbackUrlChange(event) {
		if (this.callbackURL !== event.target.value) {
			this.callbackURL = event.target.value;
			this.settings.CALLBACK.value = this.callbackURL;
			this.dispatchEvent(new CustomEvent('settingschange', { bubbles: true, composed: true, detail: this.settings }));
		}
	}

	async handleFileUpload(event) {
		const readFile = (file) => {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => {
					try {
						const jsonString = reader.result;
						const jsonData = JSON.parse(jsonString);
						console.log('Parsed JSON:', jsonData);
						resolve(jsonData);
					} catch (error) {
						reject(error);
					}
				};
				reader.readAsText(file);
			});
		};

		const flattenPostmanEnvironment = (postmanEnvFile) => {
			if (!postmanEnvFile || !postmanEnvFile.values || !Array.isArray(postmanEnvFile.values)) {
				throw new Error('Invalid Postman environment file structure');
			}

			return postmanEnvFile.values.reduce((acc, item) => {
				if (item.enabled && item.value.length > 0) {
					acc[item.key] = item.value;
				}
				return acc;
			}, {});
		};

		const parseSettings = (userData) => {
			this.settings = {
				UN: { label: 'Username', value: userData.UN },
				PW: { label: 'Password', value: userData.PW },
				LOGIN_URL: { label: 'Login Url', value: userData.loginServer },
				CONSUMER_KEY: { label: 'Consumer Key', value: userData.ConsumerKey },
				CONSUMER_SECRET: { label: 'Consumer Secret', value: userData.ConsumerSecret },
				CALLBACK: { label: 'Callback', value: this.callbackURL },
			};
			this.dispatchEvent(new CustomEvent('settingschange', { bubbles: true, composed: true, detail: this.settings }));
		};

		const writeCookie = () => {
			document.cookie = 'userData=' + encodeURIComponent(JSON.stringify(this.settings)) + '; path=/; max-age=3600';
		};

		try {
			const file = event.target.files[0];
			if (file) {
				const postmanEnvFile = await readFile(file);
				const userData = flattenPostmanEnvironment(postmanEnvFile);
				parseSettings(userData);
				writeCookie();
			}
		} catch (ex) {
			alert(ex);
		}
	}

	readCookie() {
		const name = 'userData';
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) {
			this._settings = JSON.parse(decodeURIComponent(parts.pop().split(';').shift()));
			this.dispatchEvent(new CustomEvent('settingschange', { bubbles: true, composed: true, detail: this.settings }));
		}
	}
}
