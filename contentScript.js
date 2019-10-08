chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        var contentDocument = document.getElementById("external").contentDocument
        if (request.action == "start") {
            contentDocument.getElementById("bidBtnId").disabled = false
            contentDocument.getElementById("bidBtnId").click()
            sendResponse({state:'发送成功'});
        }
        if (request.action == "syncData") {
            var ssPack = parseInt(contentDocument.getElementById("countDown_counting").innerText) * 1000
            var currentPrice = contentDocument.getElementById("currentPrice").innerText
            var ownPrice = contentDocument.getElementById("currentPrice_bidder").innerText
            var mode = contentDocument.getElementById("bidMode").innerText
            sendResponse({lastTime:ssPack,currentPrice:currentPrice,ownPrice:ownPrice,mod:mode});
        }
    }
);