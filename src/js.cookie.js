/*!
 * JavaScript Cookie v2.2.0
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
	var registeredInModuleLoader;
	if (typeof define === 'function' && define.amd) {
		define(factory);
		registeredInModuleLoader = true;
	}
	if (typeof exports === 'object') {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	/**
	 * 把输入的多个对象合并为一个新对象副本
	 *
	 * @returns {object}
	 */
	function extend () {
		console.log('---extend arguments: ', arguments);
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	/**
	 * 对字符串s中进行解码 
	 * 相当于在回调函数函数中执行decodeURIComponent进行解码
	 * 如："s%E4%B8%AD%20s%20d".replace(/(%[0-9A-Z]{2})+/g, function(a) {
	 * 		return decodeURIComponent(a);
	 * })
	 * // "s中 s d"
	 *
	 * @param {string} s
	 * @returns {string}
	 */
	function decode (s) {
		return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
	}

	/**
	 * 初始化
	 *
	 * @param {function} converter
	 * @returns {object}
	 */
	function init (converter) {
		function api() {}
		/**
		 * 设置cookie
		 *
		 * @param {string} key
		 * @param {string|object} value
		 * @param {object} attributes
		 * @returns
		 */
		function set (key, value, attributes) {
			if (typeof document === 'undefined') {
				return;
			}

			// 扩展对象
			attributes = extend({
				path: '/'
			}, api.defaults, attributes);

			// 设置过期时间
			if (typeof attributes.expires === 'number') {
				attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
			}

			// We're using "expires" because "max-age" is not supported by IE
			attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

			// 对象序列号
			try {
				var result = JSON.stringify(value);
				if (/^[\{\[]/.test(result)) {
					value = result;
				}
			} catch (e) {}

			// 对value进行编码
			value = converter.write ?
				converter.write(value, key) :
				encodeURIComponent(String(value))
					.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

			// 对key进行编码
			key = encodeURIComponent(String(key))
				.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
				.replace(/[\(\)]/g, escape);

			var stringifiedAttributes = '';
			for (var attributeName in attributes) {
				if (!attributes[attributeName]) {
					continue;
				}
				stringifiedAttributes += '; ' + attributeName;
				if (attributes[attributeName] === true) {
					continue;
				}

				// Considers RFC 6265 section 5.2:
				// ...
				// 3.  If the remaining unparsed-attributes contains a %x3B (";")
				//     character:
				// Consume the characters of the unparsed-attributes up to,
				// not including, the first %x3B (";") character.
				// ...
				stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
			}

			return (document.cookie = key + '=' + value + stringifiedAttributes);
		}

		/**
		 * 获取cookie值
		 * 
		 * @param {string} key 
		 * @param {boolean} json true就返回json，false就返回string
		 */
		function get (key, json) {
			if (typeof document === 'undefined') {
				return;
			}

			var jar = {};
			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all.
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (!json && cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = decode(parts[0]);
					cookie = (converter.read || converter)(cookie, name) ||
						decode(cookie);

					if (json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					jar[name] = cookie;

					if (key === name) {
						break;
					}
				} catch (e) {}
			}

			return key ? jar[key] : jar;
		}

		api.set = set;
		
		/**
		 * 获取字符串格式的value
		 * 
		 * @param {string} key 
		 * @return {string}	
		 */
		api.get = function (key) {
			return get(key, false /* read as raw */);
		};

		/**
		 *获取json格式的value
		 *
		 * @param {string} key
		 * @returns {json}
		 */
		api.getJSON = function (key) {
			return get(key, true /* read as json */);
		};


		/**
		 * 删除
		 *
		 * @param {string} key
		 * @param {object} attributes
		 */
		api.remove = function (key, attributes) {
			set(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.defaults = {};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));
