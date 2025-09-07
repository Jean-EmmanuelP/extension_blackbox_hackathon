// content.js - Script injecté dans les pages Google Sheets

console.log('Content script chargé sur Google Sheets');

// Notifier le background script que nous sommes sur un Google Sheet
chrome.runtime.sendMessage({
    action: 'pageLoaded',
    url: window.location.href
});

// Écouter les changements dans le document
let lastTitle = document.title;
const observer = new MutationObserver(() => {
    if (document.title !== lastTitle) {
        lastTitle = document.title;
        console.log('Titre de la page changé:', lastTitle);
        
        // Notifier le background script
        chrome.runtime.sendMessage({
            action: 'pageChanged',
            url: window.location.href,
            title: lastTitle
        });
    }
});

observer.observe(document.querySelector('title'), {
    childList: true,
    subtree: true,
    characterData: true
});