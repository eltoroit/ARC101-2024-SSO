import { createElement } from "lwc";
import App from "x/app";

const elm = createElement("x-app", { is: App });
let lwcParentDiv = document.querySelector("#main");
lwcParentDiv.appendChild(elm);
