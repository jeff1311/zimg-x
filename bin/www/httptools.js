
var XYE = window.XYE || function(){
	var oGlobal = DOMReady;
	oGlobal.define = define;
	oGlobal.require = require;
	oGlobal.each = each;
	oGlobal.autoLoad = jsMonitor;
	oGlobal.getPos = getPos;
	oGlobal.on = addEvent;
	
	return oGlobal;
	function define(cmd){
		var iNow = null,
			iTarget = oGlobal,
			i = 0,
			args = arguments;
		/*
		 * 解析'core.evt.addEvent b c'串，以空格分割。供下道工序处理
		 */
		cmd.replace(/(\w\.?)+/g, function(s){
			var arg = args[++i], 
				quence = s.split('.');
			
			//根据数组长度 分别处理
			if(quence.length > 1) {
				while(iNow = quence.shift()) iTarget = iTarget[iNow] || (iTarget[iNow] = {});
				eval('oGlobal.' + s + '=' + 	
					(arg.constructor === Function ? 'function(args){ return arg.call(oGlobal, args);}' : 'arg')
				);
			} else {
				oGlobal[s] = arg.constructor === Function ? function(args){
					return arg.call(oGlobal, args);
				} : arg;
			}
		});
	}
	function require(cmd, fn){
		var iTarget = [];
		cmd.replace(/(\w\.?)+/g, function(s){
			//根据数组长度 分别处理
			/*
				if(s.split('.').length > 1) {
					iTarget.push(eval('oGlobal.' + s))
				} else {
					iTarget.push(oGlobal[s]);
				}
			*/
			iTarget.push(s.split('.').length > 1 ? eval('oGlobal.' + s) : oGlobal[s])
			
		});
		
		fn.apply(window, iTarget);
	}
	function DOMReady(fn){
		if(fn.constructor != Function) {
			return false;
		}
		document.addEventListener('DOMContentLoaded', fn, false);
		return undefined;
	}
	function jsMonitor(germ, opts) {
		
		if(!germ) { return }
		
		var opts = opts || {},
			def = {wrap : document, jIdentity : "j", dPre : 'init', oPre : 'xye'},
			fns = {};
		
		for(var key in def) {
			def[key] = opts[key] || def[key];
		}
		var reg = new RegExp(def.oPre + '_(\\w+)');
		
		var result=[];
		if(def.wrap.getElementsByClassName) {
			result = def.wrap.getElementsByClassName(def.jIdentity);
		} else {
			var aEle = def.wrap.getElementsByTagName('*');
			var re = new RegExp('\\b'+def.jIdentity+'\\b');
			for(var i=0; i < aEle.length; i++) {
				if(re.test(aEle[i].className)) {
					result.push(aEle[i]);
				}
			}
		}

		for(var l =  result.length - 1; l >= 0; l--) {
			var m = reg.exec(result[l].className);
			
			if (m) {
			  var f = fns[m[1]];
			 
			  if (!f) {
				  f = germ[def.dPre][m[1]];
					
				  fns[m[1]] = f;//缓存一份
			  }
			  f && f(result[l]); /*如果 方法与DOM对象 匹配上 就挂载上*/
			}
		}
	}
	function each(i, l, j) {
			var k, o = 0, n = i.length;
			if (j) {
				if (n == undefined) {
					for (k in i) {
						if (l.apply(i[k], j) === !1) {
							break
						}
					}
				} else {
					for (; o < n; ) {
						if (l.apply(i[o++], j) === !1) {
							break
						}
					}
				}
			} else {
				if (n == undefined) {
					for (k in i) {
						if (l.call(i[k], k, i[k]) === !1) {
							break
						}
					}
				} else {
					for (var m = i[0]; o < n && l.call(m, o, m) !== !1; m = i[++o]) {
					}
				}
			}
			return i
	}
		
	function addEvent(obj, sEv, fn){
		obj.addEventListener(sEv, fn, false) 
	}
		
	function getPos(obj){
		return obj.getBoundingClientRect();
	}
}();

XYE.define('AJAX', function(json){
	var aj = new Object;
	var timer = null;
	json.timeout = json.timeout || 0;
	var timerFlag = false;
	if(json.timeout > 0) {
		json.timeoutFunc = typeof json.timeoutFunc == 'function' ? json.timeoutFunc : function(){};
		timer = setTimeout(function(){
			json.timeoutFunc();
			timerFlag = true;
		}, json.timeout);
	}
	
	aj.request = function() {
		if (window.XMLHttpRequest) {
			var e = new XMLHttpRequest
		} else if (window.ActiveXObject) {
			try {
				var e = new ActiveXObject("Msxml2.XMLHTTP")
			} catch (t) {
				try {
					var e = new ActiveXObject("Microsoft.XMLHTTP")
				} catch (t) {
				}
			}
		}
		if (!e) {
			window.alert("不能创建XMLHttpRequest对象<SPAN class=hilite2>实例</SPAN>.");
			return false
		}
		return e
	};
	aj.req = aj.request();
	aj.Handle = function(e) { 
		aj.req.onreadystatechange = function() {
			if (aj.req.readyState == 4) {
				if (aj.req.status == 200) { 
					clearTimeout(timer);
				
					if(json.dataType == 'json') {
						var result = JSON.parse(aj.req.responseText);
						e(result);
					} else {
						
						e(aj.req.responseText);
					}
				
				}
			}
		}
	};
	
	/* tongbu */
	aj.Handle2 = function(e){
		if(json.dataType == 'json') {
			var result = JSON.parse(aj.req.responseText);
			e(result);
		} else  {
			
			e(aj.req.responseText);
		}
	}
	
	aj.cl = function(e) {
		if (typeof e == "object") {
			var t = "";
			for (a in e) {
				t += a + "=" + e[a] + "&"
			}
			t = t.substr(0, t.length - 1);
			return t
		} else {
			return e
		}
	};
	aj.get = function(e, t) {
		var async = typeof json.async == "undefined" ? true : json.async;
		
		aj.req.open("get", e, async);
		aj.req.send(null);

		async ? aj.Handle(t) : aj.Handle2(t);
	};


	aj.post = function(e, t, n) { 
		var async = typeof json.async == "undefined" ? true : json.async;
		aj.req.open("post", e, async);
		aj.req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
		t = aj.cl(t);
		aj.req.send(t);
		async ? aj.Handle(n) : aj.Handle2(n);
		
	};

	
	
	switch (json.type) {
		case 'post' :
			aj.post(json.url, json.data, json.success);
		break;
		default :
			if(json.dataType == 'jsonp') {
				json.url += (json.url.indexOf('?') == -1) ? '?' : '&';
				var arr = [];
				for(var k in json.data) {
					arr.push(k + '=' + encodeURIComponent(json.data[k]));
				}
				json.url += arr.join('&');
				window[json.jsonpCallback] = json.success;
				var oS=document.createElement('script');
				oS.src = json.url + '&' + json.jsonp + '=' + json.jsonpCallback ;
				var oHead=document.getElementsByTagName('head')[0];
				oHead.appendChild(oS);
				oS.addEventListener('load', function(){
					oHead.removeChild(oS);
					clearTimeout(timer);
				}, false);
				
			
			} else {
				json.url += (json.url.indexOf('?') == -1) ? '?' : '&';
				var arr = [];
				for(var k in json.data) {
					arr.push(k + '=' + encodeURIComponent(json.data[k]));
				}
				json.url += arr.join('&');
				json.url += '#' + (new Date()).getTime();
				
				

				aj.get(json.url, json.success);
			}
		break;

	}
	
});