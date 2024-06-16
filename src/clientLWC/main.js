import "@lwc/synthetic-shadow";
import myHome from "c/home";
import { createElement } from "lwc";

const elm = createElement("x-app", { is: myHome });
let lwcParentDiv = document.querySelector("#main");
lwcParentDiv.appendChild(elm);
