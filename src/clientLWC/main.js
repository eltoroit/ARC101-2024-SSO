import "@lwc/synthetic-shadow";
import myHome from "c/home";
import { createElement } from "lwc";

debugger;
const elm = createElement("x-app", { is: myHome });
let lwcParentDiv = document.querySelector("#main");
lwcParentDiv.appendChild(elm);
