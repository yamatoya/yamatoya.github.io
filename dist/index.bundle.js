/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/
/******/ 		return result;
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"index": 0
/******/ 	};
/******/
/******/ 	var deferredModules = [];
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push(["./src/time-convert/index.ts","vendor"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/moment/locale sync recursive ja|lb":
/*!***********************************************!*\
  !*** ./node_modules/moment/locale sync ja|lb ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var map = {\n\t\"./ja\": \"./node_modules/moment/locale/ja.js\",\n\t\"./ja.js\": \"./node_modules/moment/locale/ja.js\",\n\t\"./lb\": \"./node_modules/moment/locale/lb.js\",\n\t\"./lb.js\": \"./node_modules/moment/locale/lb.js\"\n};\n\n\nfunction webpackContext(req) {\n\tvar id = webpackContextResolve(req);\n\treturn __webpack_require__(id);\n}\nfunction webpackContextResolve(req) {\n\tif(!__webpack_require__.o(map, req)) {\n\t\tvar e = new Error(\"Cannot find module '\" + req + \"'\");\n\t\te.code = 'MODULE_NOT_FOUND';\n\t\tthrow e;\n\t}\n\treturn map[req];\n}\nwebpackContext.keys = function webpackContextKeys() {\n\treturn Object.keys(map);\n};\nwebpackContext.resolve = webpackContextResolve;\nmodule.exports = webpackContext;\nwebpackContext.id = \"./node_modules/moment/locale sync recursive ja|lb\";\n\n//# sourceURL=webpack:///./node_modules/moment/locale_sync_ja%7Clb?");

/***/ }),

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = function(module) {\n\tif (!module.webpackPolyfill) {\n\t\tmodule.deprecate = function() {};\n\t\tmodule.paths = [];\n\t\t// module.parent = undefined by default\n\t\tif (!module.children) module.children = [];\n\t\tObject.defineProperty(module, \"loaded\", {\n\t\t\tenumerable: true,\n\t\t\tget: function() {\n\t\t\t\treturn module.l;\n\t\t\t}\n\t\t});\n\t\tObject.defineProperty(module, \"id\", {\n\t\t\tenumerable: true,\n\t\t\tget: function() {\n\t\t\t\treturn module.i;\n\t\t\t}\n\t\t});\n\t\tmodule.webpackPolyfill = 1;\n\t}\n\treturn module;\n};\n\n\n//# sourceURL=webpack:///(webpack)/buildin/module.js?");

/***/ }),

/***/ "./src/time-convert/index.ts":
/*!***********************************!*\
  !*** ./src/time-convert/index.ts ***!
  \***********************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var moment_locale_ja__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! moment/locale/ja */ \"./node_modules/moment/locale/ja.js\");\n/* harmony import */ var moment_locale_ja__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(moment_locale_ja__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var moment_locale_lb__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! moment/locale/lb */ \"./node_modules/moment/locale/lb.js\");\n/* harmony import */ var moment_locale_lb__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(moment_locale_lb__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! moment */ \"./node_modules/moment/moment.js\");\n/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var moment_timezone__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! moment-timezone */ \"./node_modules/moment-timezone/index.js\");\n/* harmony import */ var moment_timezone__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(moment_timezone__WEBPACK_IMPORTED_MODULE_3__);\n\r\n\r\n\r\n\r\nwindow.addEventListener('DOMContentLoaded', function () {\r\n    var timeConvertor = new TimeConvertor();\r\n    timeConvertor.convert();\r\n    var btnConvert = document.getElementById('btnConvert');\r\n    if (btnConvert != null) {\r\n        btnConvert.addEventListener('click', function () {\r\n            return timeConvertor.convert();\r\n        });\r\n    }\r\n});\r\nvar TimeConvertor = /** @class */ (function () {\r\n    function TimeConvertor() {\r\n        this.startDateInput = document.getElementById('startDate');\r\n        this.endDateInput = document.getElementById('endDate');\r\n        this.initial();\r\n    }\r\n    TimeConvertor.prototype.initial = function () {\r\n        var params = new URLSearchParams(window.location.search);\r\n        if (params.has('start')) {\r\n            var start = params.get('start');\r\n            if (start != null) {\r\n                this.startDateInput.value = moment__WEBPACK_IMPORTED_MODULE_2___default.a.unix(parseInt(start)).format(moment__WEBPACK_IMPORTED_MODULE_2___default.a.HTML5_FMT.DATETIME_LOCAL);\r\n            }\r\n        }\r\n        else {\r\n            this.startDateInput.value = moment__WEBPACK_IMPORTED_MODULE_2___default()().format(moment__WEBPACK_IMPORTED_MODULE_2___default.a.HTML5_FMT.DATETIME_LOCAL);\r\n        }\r\n        if (params.has('end')) {\r\n            var end = params.get('end');\r\n            if (end != null) {\r\n                this.endDateInput.value = moment__WEBPACK_IMPORTED_MODULE_2___default.a.unix(parseInt(end)).format(moment__WEBPACK_IMPORTED_MODULE_2___default.a.HTML5_FMT.DATETIME_LOCAL);\r\n            }\r\n        }\r\n        else {\r\n            this.endDateInput.value = moment__WEBPACK_IMPORTED_MODULE_2___default()().format(moment__WEBPACK_IMPORTED_MODULE_2___default.a.HTML5_FMT.DATETIME_LOCAL);\r\n        }\r\n    };\r\n    TimeConvertor.prototype.convert = function () {\r\n        var startLocalTime = this.startDateInput.value;\r\n        var endLocalTime = this.endDateInput.value;\r\n        this.setQueryString(startLocalTime, endLocalTime);\r\n        this.updateConverData(startLocalTime, endLocalTime);\r\n    };\r\n    TimeConvertor.prototype.setQueryString = function (startLocalTime, endLocalTime) {\r\n        var params = new URLSearchParams(location.search);\r\n        params.set('start', moment__WEBPACK_IMPORTED_MODULE_2___default()(startLocalTime).unix().toString());\r\n        params.set('end', moment__WEBPACK_IMPORTED_MODULE_2___default()(endLocalTime).unix().toString());\r\n        console.log(params.toString());\r\n        history.pushState({}, '', location.pathname + \"?\" + params.toString());\r\n    };\r\n    TimeConvertor.prototype.updateConverData = function (startLocalTime, endLocalTIme) {\r\n        moment__WEBPACK_IMPORTED_MODULE_2___default.a.locale('ja');\r\n        var jp = document.getElementById('jp');\r\n        if (jp != null) {\r\n            jp.innerHTML = \"<th scope=\\\"row\\\">Asia/Tokyo +9</th><td>\" + moment__WEBPACK_IMPORTED_MODULE_2___default()(startLocalTime).tz(\"Asia/Tokyo\").format('llll') + \"</td><td>\" + moment__WEBPACK_IMPORTED_MODULE_2___default()(endLocalTIme).tz(\"Asia/Tokyo\").format('llll') + \"</td>\";\r\n        }\r\n        moment__WEBPACK_IMPORTED_MODULE_2___default.a.locale('lb');\r\n        var eu = document.getElementById('eu');\r\n        if (eu != null) {\r\n            eu.innerHTML = \"<th scope=\\\"row\\\">Europe/Luxembourg +2</th><td>\" + moment__WEBPACK_IMPORTED_MODULE_2___default()(startLocalTime).tz(\"Europe/Luxembourg\").format('llll') + \"</td><td>\" + moment__WEBPACK_IMPORTED_MODULE_2___default()(endLocalTIme).tz(\"Europe/Luxembourg\").format('llll') + \"</td>\";\r\n        }\r\n        moment__WEBPACK_IMPORTED_MODULE_2___default.a.locale('en');\r\n        var us = document.getElementById('us');\r\n        if (us != null) {\r\n            us.innerHTML = \"<th scope=\\\"row\\\">America/Los_Angeles -7</th><td>\" + moment__WEBPACK_IMPORTED_MODULE_2___default()(startLocalTime).tz(\"America/Los_Angeles\").format('llll') + \"</td><td>\" + moment__WEBPACK_IMPORTED_MODULE_2___default()(endLocalTIme).tz(\"America/Los_Angeles\").format('llll') + \"</td>\";\r\n        }\r\n        var utc = document.getElementById('utc');\r\n        if (utc != null) {\r\n            utc.innerHTML = \"<th scope=\\\"row\\\">UTC \\u00B10</th><td>\" + moment__WEBPACK_IMPORTED_MODULE_2___default()(startLocalTime).tz(\"UTC\").format('llll') + \"</td><td>\" + moment__WEBPACK_IMPORTED_MODULE_2___default()(endLocalTIme).tz(\"UTC\").format('llll') + \"</td>\";\r\n        }\r\n    };\r\n    return TimeConvertor;\r\n}());\r\n\n\n//# sourceURL=webpack:///./src/time-convert/index.ts?");

/***/ })

/******/ });