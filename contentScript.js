chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        var contentDocument = document.getElementById("external").contentDocument
        if (request.action == "start") {
            var mode = contentDocument.getElementById("bidMode").innerText
            if (request.mode == mode && mode == '单价' ){
                var table = contentDocument.getElementById("packDetailTab")
                if (table.rows.length != 4) {
                    sendResponse({state:'发送失败,无法找到价格输入DOM'});
                    return
                }
                var input = contentDocument.getElementsByClassName("TB_priceInput")
                if (input.length != 1){
                    sendResponse({state:'发送失败,价格输入DOM数不唯一'});
                    return
                }
                if (input[0].tagName != 'INPUT'){
                    sendResponse({state:'发送失败,无法找到价格输入DOM,未知标签类型'+input[0].tagName});
                }
                input[0].value = request.price
            } else {
                sendResponse({state:'发送失败,未知模式'});
            }
            contentDocument.getElementById("bidBtnId").disabled = false
            //TODO 需要测试后 才开放自动点击按钮
            //contentDocument.getElementById("bidBtnId").click()
            sendResponse({state:'发送成功'});
        }
        if (request.action == "syncData") {
            //var ssPack = parseInt(contentDocument.getElementById("countDown_counting").innerText) * 1000
            var currentPrice = contentDocument.getElementById("currentPrice").innerText
            var ownPrice = contentDocument.getElementById("currentPrice_bidder").innerText
            var mode = contentDocument.getElementById("bidMode").innerText
            sendResponse({currentPrice:currentPrice,ownPrice:ownPrice,mode:mode});
        }
    }
);