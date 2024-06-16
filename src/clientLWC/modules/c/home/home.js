import { LightningElement } from "lwc";

export default class Home extends LightningElement {
	onHelloEvent(event) {
		let detail = event.detail;
		detail.push("App");
		const selectedEvent = new CustomEvent("hello", { detail });
		this.dispatchEvent(selectedEvent);
		// debugger;
	}
}
