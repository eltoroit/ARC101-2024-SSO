import { LightningElement, api } from 'lwc';

export default class Settings extends LightningElement {
	list = [];
	_keys = [];
	_settings = {};

	@api
	get settings() {
		return this._settings;
	}
	set settings(value) {
		this._settings = { ...value };
		this.makeList();
	}

	@api
	get keys() {
		return this._keys;
	}
	set keys(value) {
		this._keys = value;
		this.makeList();
	}

	makeList() {
		this.list = [];
		if (this.settings && this.keys) {
			for (let key in this.settings) {
				if ({}.hasOwnProperty.call(this.settings, key)) {
					this.list.push({ key, ...this.settings[key], readonly: true, disabled: false, class: `disabled` });
				}
			}
			if (this.keys.length > 0) {
				this.list = this.list.filter((item) => this.keys.includes(item.key));
			}
			console.log(this.list);
		}
	}

	onClick(event) {
		if (event.target.readOnly) {
			let value = event.target.value;
			navigator.clipboard
				.writeText(value)
				.then(() => {
					alert(`Copied: ${value}`);
				})
				.catch((err) => {
					alert('Error copying to the clipboard');
				});
		}
	}
}
