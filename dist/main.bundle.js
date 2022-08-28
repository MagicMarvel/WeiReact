/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!************************!*\
  !*** ./src/Didact.tsx ***!
  \************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WeiReact": () => (/* binding */ WeiReact)
/* harmony export */ });
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
function createElement(type, props) {
    var children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
    }
    return {
        type: type,
        props: __assign(__assign({}, props), { children: children
                ? children.map(function (child) {
                    if (typeof child === "string") {
                        return {
                            type: "TEXT_ELEMENT",
                            props: { nodeValue: child },
                        };
                    }
                    return child;
                })
                : [] }),
    };
}
function render(element, container) {
    function createDom(element) {
        if (element.type == "TEXT_ELEMENT") {
            return document.createTextNode(element.props.nodeValue);
        }
        else if (element.props.children.length == 0) {
            return document.createElement(element.type);
        }
        else {
            var dom_1 = document.createElement(element.type);
            element.props.children.forEach(function (child) {
                dom_1.appendChild(createDom(child));
            });
            return dom_1;
        }
    }
    container.appendChild(createDom(element));
}
var WeiReact = { createElement: createElement, render: render };
var element = (WeiReact.createElement("div", null,
    WeiReact.createElement("div", null, "asdfadsf")));
render(element, document.getElementById("root"));

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5idW5kbGUuanMiLCJtYXBwaW5ncyI6Ijs7VUFBQTtVQUNBOzs7OztXQ0RBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1lBLFNBQVMsYUFBYSxDQUFDLElBQWlDLEVBQUUsS0FBYTtJQUFFLGtCQUE0QztTQUE1QyxVQUE0QyxFQUE1QyxxQkFBNEMsRUFBNUMsSUFBNEM7UUFBNUMsaUNBQTRDOztJQUNqSCxPQUFPO1FBQ0gsSUFBSTtRQUNKLEtBQUssd0JBQ0UsS0FBSyxLQUNSLFFBQVEsRUFBRSxRQUFRO2dCQUNkLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUMsS0FBSztvQkFDZixJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTt3QkFDM0IsT0FBTzs0QkFDSCxJQUFJLEVBQUUsY0FBYzs0QkFDcEIsS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRTt5QkFDOUIsQ0FBQztxQkFDTDtvQkFDRCxPQUFPLEtBQUssQ0FBQztnQkFDakIsQ0FBQyxDQUFDO2dCQUNKLENBQUMsQ0FBQyxFQUFFLEdBQ1g7S0FDSixDQUFDO0FBQ04sQ0FBQztBQUVELFNBQVMsTUFBTSxDQUFDLE9BQTJCLEVBQUUsU0FBc0I7SUFDL0QsU0FBUyxTQUFTLENBQUMsT0FBMkI7UUFDMUMsSUFBSSxPQUFPLENBQUMsSUFBSSxJQUFJLGNBQWMsRUFBRTtZQUNoQyxPQUFPLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUMzRDthQUFNLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtZQUMzQyxPQUFPLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQy9DO2FBQU07WUFDSCxJQUFNLEtBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqRCxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFLO2dCQUNqQyxLQUFHLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxLQUFHLENBQUM7U0FDZDtJQUNMLENBQUM7SUFDRCxTQUFTLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQzlDLENBQUM7QUFFTSxJQUFNLFFBQVEsR0FBRyxFQUFFLGFBQWEsaUJBQUUsTUFBTSxVQUFFLENBQUM7QUFFbEQsSUFBTSxPQUFPLEdBQUcsQ0FDWjtJQUNJLCtDQUFtQixDQUNqQixDQUNULENBQUM7QUFFRixNQUFNLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy8uL3NyYy9EaWRhY3QudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8vIFRoZSByZXF1aXJlIHNjb3BlXG52YXIgX193ZWJwYWNrX3JlcXVpcmVfXyA9IHt9O1xuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwidHlwZSBFbGVtZW50SW5mb3JtYXRpb24gPVxuICAgIHwge1xuICAgICAgICAgIC8v5qCH562+5ZCNXG4gICAgICAgICAgdHlwZToga2V5b2YgSFRNTEVsZW1lbnRUYWdOYW1lTWFwO1xuICAgICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICAgIC8v5bGe5oCnXG4gICAgICAgICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcbiAgICAgICAgICAgICAgLy/lrZDlhYPntKBcbiAgICAgICAgICAgICAgY2hpbGRyZW46IEVsZW1lbnRJbmZvcm1hdGlvbltdO1xuICAgICAgICAgIH07XG4gICAgICB9XG4gICAgfCB7XG4gICAgICAgICAgdHlwZTogXCJURVhUX0VMRU1FTlRcIjtcbiAgICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgICBub2RlVmFsdWU6IHN0cmluZztcbiAgICAgICAgICB9O1xuICAgICAgfTtcblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudCh0eXBlOiBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXAsIHByb3BzOiBPYmplY3QsIC4uLmNoaWxkcmVuOiAoRWxlbWVudEluZm9ybWF0aW9uIHwgc3RyaW5nKVtdKTogRWxlbWVudEluZm9ybWF0aW9uIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0eXBlLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgLi4ucHJvcHMsXG4gICAgICAgICAgICBjaGlsZHJlbjogY2hpbGRyZW5cbiAgICAgICAgICAgICAgICA/IGNoaWxkcmVuLm1hcCgoY2hpbGQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNoaWxkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIlRFWFRfRUxFTUVOVFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHM6IHsgbm9kZVZhbHVlOiBjaGlsZCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIDogW10sXG4gICAgICAgIH0sXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyKGVsZW1lbnQ6IEVsZW1lbnRJbmZvcm1hdGlvbiwgY29udGFpbmVyOiBIVE1MRWxlbWVudCkge1xuICAgIGZ1bmN0aW9uIGNyZWF0ZURvbShlbGVtZW50OiBFbGVtZW50SW5mb3JtYXRpb24pOiBIVE1MRWxlbWVudCB8IFRleHQge1xuICAgICAgICBpZiAoZWxlbWVudC50eXBlID09IFwiVEVYVF9FTEVNRU5UXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShlbGVtZW50LnByb3BzLm5vZGVWYWx1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZWxlbWVudC5wcm9wcy5jaGlsZHJlbi5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoZWxlbWVudC50eXBlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGRvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoZWxlbWVudC50eXBlKTtcbiAgICAgICAgICAgIGVsZW1lbnQucHJvcHMuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgICAgICAgICBkb20uYXBwZW5kQ2hpbGQoY3JlYXRlRG9tKGNoaWxkKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBkb207XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGNyZWF0ZURvbShlbGVtZW50KSk7XG59XG5cbmV4cG9ydCBjb25zdCBXZWlSZWFjdCA9IHsgY3JlYXRlRWxlbWVudCwgcmVuZGVyIH07XG5cbmNvbnN0IGVsZW1lbnQgPSAoXG4gICAgPGRpdj5cbiAgICAgICAgPGRpdj5hc2RmYWRzZjwvZGl2PlxuICAgIDwvZGl2PlxuKTtcblxucmVuZGVyKGVsZW1lbnQsIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicm9vdFwiKSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=