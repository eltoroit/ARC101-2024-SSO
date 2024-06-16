import { createElement } from "lwc";
import myHome from "c/home";

debugger;
const elm = createElement("x-app", { is: myHome });
let lwcParentDiv = document.querySelector("#main");
lwcParentDiv.appendChild(elm);
