import { LightningElement } from "lwc";

export default class Parent extends LightningElement {
	onHelloEvent(event) {
		let detail = event.detail;
		detail.push("Parent");
		const selectedEvent = new CustomEvent("hello", { detail });
		this.dispatchEvent(selectedEvent);
		// debugger;
	}
}
