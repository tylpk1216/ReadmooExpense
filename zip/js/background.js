chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                // test wrong case
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {hostEquals: 'developer.chrome.com'}
                }),
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {hostEquals: 'member.readmoo.com', pathContains:'order'}
                })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});
