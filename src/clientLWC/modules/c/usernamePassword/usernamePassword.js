import { LightningElement, api } from 'lwc';

export default class UsernamePassword extends LightningElement {
	@api settings;
	keys = ['UN', 'PW'];

	onLoginClick() {
		const data = {
			method: 'POST',
			url: `${this.settings.LOGIN_URL.value}/services/oauth2/token`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: {
				grant_type: 'password',
				client_id: this.settings.CONSUMER_KEY.value,
				client_secret: this.settings.CONSUMER_SECRET.value,
				username: this.settings.UN.value,
				password: this.settings.PW.value,
			},
		};
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		};

		fetch(`/proxy`, options)
			.then((response) => {
				debugger;
				return response.text();
			})
			.then((txtData) => {
				const jsonData = JSON.parse(txtData);
				this.dispatchEvent(new CustomEvent('results', { bubbles: true, composed: true, detail: { data: jsonData } }));
			})
			.catch((error) => {
				console.error('error', error);
				alert(error);
			});
	}
}
