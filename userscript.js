// ==UserScript==
// @name                Twitter (x) 中文汉化插件
// @namespace           https://github.com/wjm13206/x-i18n-plugin/
// @version             1.0
// @description         Twitter (X) 中文汉化插件
// @author              k1995
// @match               https://twitter.com/*
// @match               https://x.com/*
// @grant               GM_getResourceText
// @resource            zh-CN https://raw.githubusercontent.com/wjm13206/x-i18n-plugin/master/locales/zh-CN.json
// @require             https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @license             MIT
// ==/UserScript==

(function() {
  'use strict';

  const lang = "zh-CN"; // 只支持中文
  const locales = JSON.parse(GM_getResourceText(lang));

  // 初始化翻译
  translatePage();
  
  // 监听DOM变化
  observeDOMChanges();

  function translateElement(el) {
    if (!el || !el.nodeValue) return;

    const txtSrc = el.nodeValue.trim();
    if (!txtSrc) return;

    const key = txtSrc.toLowerCase()
      .replace(/\xa0/g, ' ') // 替换 &nbsp;
      .replace(/\s{2,}/g, ' ');

    if (locales.dict[key]) {
      el.nodeValue = el.nodeValue.replace(txtSrc, locales.dict[key]);
    }
  }

  function shouldTranslateEl(el) {
    const blockTags = ["SCRIPT", "STYLE", "CODE", "PRE", "TEXTAREA"];
    if (blockTags.includes(el.tagName)) {
      return false;
    }
    
    // 跳过特定类名
    if (el.classList) {
      const blockClasses = ["emoji", "icon", "username", "handle"];
      for (let cls of blockClasses) {
        if (el.classList.contains(cls)) {
          return false;
        }
      }
    }
    
    return true;
  }

  function traverseElement(el) {
    if (!shouldTranslateEl(el)) return;

    if (el.nodeType === Node.TEXT_NODE) {
      translateElement(el);
      return;
    }

    for (const child of el.childNodes) {
      traverseElement(child);
    }
  }

  function observeDOMChanges() {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          traverseElement(node);
        });
      });
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true
    });
  }

  function translatePage() {
    traverseElement(document.body);
    applyCSSOverrides();
  }

  function applyCSSOverrides() {
    if (locales.css) {
      for (const css of locales.css) {
        if ($(css.selector).length > 0) {
          if (css.key === '!html') {
            $(css.selector).html(css.replacement);
          } else {
            $(css.selector).attr(css.key, css.replacement);
          }
        }
      }
    }
  }
})();
