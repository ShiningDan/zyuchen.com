"use strict";function ls(e,o){var n=document.getElementById(e);if(!n)throw new Error("ls save fn not find "+e);if(window.localStorage)try{window.localStorage.setItem(e,n.innerHTML),document.cookie="v="+o}catch(e){console.log(e)}}function ll(e,o){var n=window.localStorage.getItem(e);if(!n)throw document.cookie="v=; expires=Thu, 01 Jan 1970 00:00:01 GMT;",window.location.reload(),new Error("ls load fn not find "+e);var t=o?"script":"style",r=document.createElement(t);r.innerHTML=n,document.head.appendChild(r)}