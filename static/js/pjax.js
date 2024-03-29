﻿var ajaxignore_string = new String('data:, /wp-, /rss, /feed, /sitemap.xml, /sitemap.html, #respond, #toc_i-, javascript:, .pdf, .zip, .rar, .7z, .jpg, .png, .gif, .bmp');
$(document).on("click","*:not(#comments-nav)>a[target!=_blank]",function(){
    if($(this).attr("href")){
        var req_url = $(this).attr("href")
        if(!ajaxcheck_do(req_url)){
            return true
        }else{
            ajax(req_url,"pagelink")
        }
    }
    return false
});
$(document).on("click","#comments-nav a",function(){
    ajax($(this).attr("href"),"comtpagenav");
    return false
});
$(document).on("submit","#searchform",function(){
    ajax(this.action+"?s="+$(this).find("#search").val(),"search");
    return false
});
$(function(){
    window.addEventListener("popstate",function(e){
        if(e.state){
            document.title = e.state.title;
            $("#container").html(e.state.html);
            window.load = $(this).kratos_pjax_reload()
        }
    })
});
var ajaxignore = ajaxignore_string.split(', ');
function ajaxcheck_do(url){
    if(!url) return false;
    for(var i in ajaxignore){
        if(url.indexOf(ajaxignore[i])>=0){
            return false
        }
    }
    return true
}
function ajax(reqUrl,msg,getData){
    NProgress.start();
    $("#container").fadeTo("fast",0.7);
    if(msg=="comtpagenav"){
        $("body,html").animate({
            scrollTop: $(".comment-list").offset().top - xb.site_sh
        },400)
    }else if(msg=="pagelink"||msg=="search"){
        if(reqUrl.indexOf("#")==-1){
            $("body,html").animate({
                scrollTop: $("#kratos-blog-post").offset().top - document.getElementById("kratos-header-section").offsetHeight
            },400)
        }
    }
    $.ajax({
        url: reqUrl,
        type: "GET",
        data: getData,
		beforeSend: function(){
			history.replaceState({
				url: window.document.location.href,
				title: window.document.title,
				html: $(document).find("#container").html(),
			},window.document.title,document.location.href)
		},
        success: function(data){
            document.title = $(data).filter("title").text();
            window.history.pushState({
                url: reqUrl,
                title: $(data).filter("title").text(),
                html: $(data).find("#container").html()
            },$(data).filter("title").text(),reqUrl);
            if(msg=="pagelink"){
                $("#container").html($(data).find("#container").html());
                var anchor = window.location.hash.substring(location.hash.indexOf("#")+1);
                if(anchor){
                    $("body,html").animate({
                        scrollTop: $("#"+anchor).offset().top - xb.site_sh
                    },600)
                }
                try{$("pre>code").each(function(){hljs.highlightBlock(this)})}catch(err){}
            }else if(msg=="search"){
                $("#container").html($(data).find("#container").html());
                $("#searchform").animate({width:"0"},200);
                $("#searchform input").val('')
            }else if(msg=="comtpagenav"){
                $("#container").html($(data).find("#container").html());
                $("#comments-nav").html($(data).find("#comments-nav").html())
            }
            $("#container").fadeTo("fast",1);
            window.load = $(this).kratos_pjax_reload();
            NProgress.done()
        },
        error: function(request){
            $("#container").fadeTo("fast",1);
            location.href = reqUrl
        }
    })
}
(function(root, factory){
    if (typeof define === "function" && define.amd) {
        define(factory)
    } else {
        if (typeof exports === "object") {
            module.exports = factory()
        } else {
            root.NProgress = factory()
        }
    }
})(this,function(){
    var NProgress = {};
    NProgress.version = "0.2.0";
    var Settings = NProgress.settings = {
        minimum: 0.08,
        easing: "linear",
        positionUsing: "",
        speed: 200,
        trickle: true,
        trickleSpeed: 200,
        showSpinner: true,
        barSelector: '[role="bar"]',
        spinnerSelector: '[role="spinner"]',
        parent: "body",
        template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
    };
    NProgress.configure = function(options) {
        var key,value;
        for(key in options){
            value = options[key];
            if(value!==undefined&&options.hasOwnProperty(key)){Settings[key] = value}
        }
        return this
    };
    NProgress.status = null;
    NProgress.set = function(n){
        var started = NProgress.isStarted();
        n = clamp(n,Settings.minimum,1);
        NProgress.status = (n===1?null:n);
        var progress = NProgress.render(!started),
        bar = progress.querySelector(Settings.barSelector),
        speed = Settings.speed,
        ease = Settings.easing;
        progress.offsetWidth;
        queue(function(next){
            if(Settings.positionUsing===""){Settings.positionUsing = NProgress.getPositioningCSS()}
            css(bar,barPositionCSS(n,speed,ease));
            if(n===1){
                css(progress,{transition:"none",opacity:1});
                progress.offsetWidth;
                setTimeout(function(){
                    css(progress,{transition:"all "+speed+"ms linear",opacity:0});
                    setTimeout(function(){
                        NProgress.remove();
                        next()
                    },speed)
                },speed)
            }else{
                setTimeout(next,speed)
            }
        });
        return this
    };
    NProgress.isStarted = function(){return typeof NProgress.status === "number"};
    NProgress.start = function(){
        if(!NProgress.status){NProgress.set(0)}
        var work = function(){
            setTimeout(function(){
                if(!NProgress.status){return}
                NProgress.trickle();
                work()
            },Settings.trickleSpeed)
        };
        if(Settings.trickle){work()}
        return this
    };
    NProgress.done = function(force){
        if(!force&&!NProgress.status){return this}
        return NProgress.inc(0.3+0.5*Math.random()).set(1)
    };
    NProgress.inc = function(amount){
        var n = NProgress.status;
        if(!n){
            return NProgress.start()
        }else{
            if(n>1){
                return
            }else{
                if(typeof amount!=="number"){
                    if(n>=0&&n< 0.2){
                        amount = 0.1
                    }else{
                        if(n>=0.2&&n< 0.5){
                            amount = 0.04
                        }else{
                            if(n>=0.5&&n<0.8){
                                amount = 0.02
                            }else{
                                if(n>=0.8&&n<0.99){
                                    amount = 0.005
                                }else{
                                    amount = 0
                                }
                            }
                        }
                    }
                }
                n = clamp(n+amount,0,0.994);
                return NProgress.set(n)
            }
        }
    };
    NProgress.trickle = function(){return NProgress.inc()}; 
    (function(){
        var initial = 0,
        current = 0;
        NProgress.promise = function($promise){
            if(!$promise||$promise.state()==="resolved"){return this}
            if(current===0){NProgress.start()}
            initial++;
            current++;
            $promise.always(function(){
                current--;
                if(current===0){
                    initial = 0;
                    NProgress.done()
                }else{
                    NProgress.set((initial-current)/initial)
                }
            });
            return this
        }
    })();
    NProgress.render = function(fromStart){
        if(NProgress.isRendered()){return document.getElementById("nprogress")}
        addClass(document.documentElement,"nprogress-busy");
        var progress = document.createElement("div");
        progress.id = "nprogress";
        progress.innerHTML = Settings.template;
        var bar = progress.querySelector(Settings.barSelector),perc = fromStart?"-100":toBarPerc(NProgress.status||0),parent = document.querySelector(Settings.parent),spinner;
        css(bar,{transition:"all 0 linear",transform:"translate3d("+perc+"%,0,0)"});
        if(!Settings.showSpinner){
            spinner = progress.querySelector(Settings.spinnerSelector);
            spinner&&removeElement(spinner)
        }
        if(parent!=document.body){addClass(parent,"nprogress-custom-parent")}
        parent.appendChild(progress);
        return progress
    };
    NProgress.remove = function(){
        removeClass(document.documentElement,"nprogress-busy");
        removeClass(document.querySelector(Settings.parent),"nprogress-custom-parent");
        var progress = document.getElementById("nprogress");
        progress&&removeElement(progress)
    };
    NProgress.isRendered = function(){return!!document.getElementById("nprogress")};
    NProgress.getPositioningCSS = function(){
        var bodyStyle = document.body.style;
        var vendorPrefix = ("WebkitTransform" in bodyStyle)?"Webkit":("MozTransform" in bodyStyle)?"Moz":("msTransform" in bodyStyle)?"ms":("OTransform" in bodyStyle)?"O":"";
        if(vendorPrefix+"Perspective" in bodyStyle){
            return "translate3d"
        }else{
            if(vendorPrefix+"Transform" in bodyStyle){
                return "translate"
            }else{
                return "margin"
            }
        }
    };
    function clamp(n,min,max){
        if(n<min){return min}
        if(n>max){return max}
        return n
    }
    function toBarPerc(n){return (-1+n)*100}
    function barPositionCSS(n,speed,ease){
        var barCSS;
        if(Settings.positionUsing==="translate3d"){
            barCSS = {transform:"translate3d("+toBarPerc(n)+"%,0,0)"}
        }else{
            if(Settings.positionUsing==="translate"){
                barCSS = {transform:"translate("+toBarPerc(n)+"%,0)"}
            }else{
                barCSS = {"margin-left":toBarPerc(n)+"%"}
            }
        }
        barCSS.transition = "all "+speed+"ms "+ease;
        return barCSS
    }
    var queue = (function(){
        var pending = [];
        function next(){
            var fn = pending.shift();
            if(fn){fn(next)}
        }
        return function(fn){
            pending.push(fn);
            if(pending.length==1){next()}
        }
    })();
    var css = (function(){
        var cssPrefixes = ["Webkit","O","Moz","ms"],cssProps = {};
        function camelCase(string){return string.replace(/^-ms-/,"ms-").replace(/-([\da-z])/gi,function(match,letter){return letter.toUpperCase()})}
        function getVendorProp(name){
            var style = document.body.style;
            if(name in style){return name}
            var i = cssPrefixes.length,capName = name.charAt(0).toUpperCase() + name.slice(1),vendorName;
            while(i--){
                vendorName = cssPrefixes[i]+capName;
                if(vendorName in style){return vendorName}
            }
            return name
        }
        function getStyleProp(name){
            name = camelCase(name);
            return cssProps[name]||(cssProps[name]=getVendorProp(name))
        }
        function applyCss(element,prop,value){
            prop = getStyleProp(prop);
            element.style[prop] = value
        }
        return function(element,properties){
            var args = arguments,prop,value;
            if(args.length==2){
                for(prop in properties){
                    value = properties[prop];
                    if(value!==undefined&&properties.hasOwnProperty(prop)){applyCss(element,prop,value)}
                }
            }else{
                applyCss(element,args[1],args[2])
            }
        }
    })();
    function hasClass(element,name){
        var list = typeof element == "string"?element:classList(element);
        return list.indexOf(" "+name+" ")>=0
    }
    function addClass(element,name){
        var oldList = classList(element),
        newList = oldList+name;
        if(hasClass(oldList,name)){return}
        element.className = newList.substring(1)
    }
    function removeClass(element,name){
        var oldList = classList(element),newList;
        if(!hasClass(element,name)){return}
        newList = oldList.replace(" "+name+" "," ");
        element.className = newList.substring(1,newList.length-1)
    }
    function classList(element){
        return (" "+(element&&element.className||"")+" ").replace(/\s+/gi," ")
    }
    function removeElement(element){
        element&&element.parentNode&&element.parentNode.removeChild(element)
    }
    return NProgress
});