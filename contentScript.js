chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action == "start") {
            document.getElementById("bidBtnId").disabled = false
            document.getElementById("bidBtnId").click()
            sendResponse({state:'发送成功'});
        }
        if (request.action == "syncData") {
            var ssPack = parseInt(document.getElementById("countDown_counting").innerText) * 1000
            var currentPrice = parseInt(document.getElementById("packSumPriceId").innerText)
            sendResponse({lifeiTime:ssPack,lifeiPrice:currentPrice});
        }
    }
);