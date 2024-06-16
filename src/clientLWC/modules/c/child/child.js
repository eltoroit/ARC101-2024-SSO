import { LightningElement } from "lwc";

export default class Child extends LightningElement {
	onWorldClick() {
		let detail = ["Child"];
		const selectedEvent = new CustomEvent("hello", { detail });
		this.dispatchEvent(selectedEvent);
		debugger;
	}
}
