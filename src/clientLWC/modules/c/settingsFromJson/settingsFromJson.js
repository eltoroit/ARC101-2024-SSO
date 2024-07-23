import { LightningElement, api } from "lwc";

export default class Home extends LightningElement {
	_settings = {};
	callbackURL = "";

	@api
	get settings() {
		return this._settings;
	}
	set settings(value) {
		if (value.CALLBACK) {
			this._settings = JSON.parse(JSON.stringify(value));
			this.callbackURL = this._settings.CALLBACK.value;
		}
	}

	onCallbackUrlChange(event) {
		if (this.callbackURL !== event.target.value) {
			this.callbackURL = event.target.value;
			this.settings.CALLBACK.value = this.callbackURL;
			this.dispatchEvent(new CustomEvent("settingschange", { bubbles: true, composed: true, detail: this.settings }));
		}
	}

	onPaste(event) {
		clearTimeout(this.debouncer);
		let textAreaValue = event.clipboardData.getData("text");
		try {
			let jsontData = JSON.parse(textAreaValue);
			let userData = jsontData.user;
			this.settings = {
				UN: { label: "Username", value: userData.username },
				PW: { label: "Password", value: userData.password },
				LOGIN_URL: { label: "Login Url", value: userData.instanceUrl },
				CONSUMER_KEY: { label: "Consumer Key", value: userData.consumerKey },
				CONSUMER_SECRET: { label: "Consumer Secret", value: userData.consumerSecret },
				CALLBACK: { label: "Callback", value: this.callbackURL },
			};
			this.dispatchEvent(new CustomEvent("settingschange", { bubbles: true, composed: true, detail: this.settings }));
		} catch (ex) {
			debugger;
			console.log(ex);
			throw ex;
		}
	}
}
