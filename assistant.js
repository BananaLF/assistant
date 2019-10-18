var syncStart = false
var syncPrice = 0
var myPrice = 0
var num = 0
var appMode = "单价"
var interval = 0
var maxPrice = 0
var sendPriceHistory = 0
var pause = false
//notifySyncData()

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(tab.id, {file: 'jquery.min.js'});
    chrome.tabs.executeScript(tab.id, {file: 'content.js'});
});

$(function(){
    var state = $('#state');
    $('#startSync').click(function () {//给对象绑定事件
        interval = parseInt(document.getElementById("intervalText").value)
        maxPrice = parseInt(document.getElementById("maxPriceText").value)
        startSync()
    });
    $('#stopSync').click(function () {//给对象绑定事件
        updateUI()
        stopSync()
    });
})

//开始同步自动报价
function startSync() {
    console.log("startSync");
    syncStart= true
    notifySyncData()
    //延迟一秒执行自己
    setTimeout(function () {
        TimeDown();
    }, 100)
}

//停止同步自动报价
function stopSync() {
    console.log("stopSync");
    syncStart = false
    sendPriceHistory = 0
    waitTime = 0
}

//通知contentScript 向目标界面发送最后价格
function notifySendPrice(price,totalPrice) {
    chrome.tabs.query({active:true, currentWindow:true}, function (tab) {//获取当前tab
        //向tab发送请求
        chrome.tabs.sendMessage(tab[0].id, {
            action: "start",
            price:price,
            totoalPrice:totalPrice,
            mode:appMode,
        }, function (response) {
            console.log(response);
            if (response.state != '发送成功') {
                syncStart = false
                alert(response.state)
            }
        });
    });
}

//通知contentScript 向目标界面同步数据(时间,最新价格)
function notifySyncData() {
    chrome.tabs.query({active:true, currentWindow:true}, function (tab) {//获取当前tab
        //向tab发送请求
        chrome.tabs.sendMessage(tab[0].id, {
            action: "syncData",
        }, function (response) {
            console.log("syncData",response)
            updateData(response.currentPrice,response.ownPrice,response.mode)
        });
    });
}

//定时器, 1ms执行一次. 时间消耗完或主动暂停时停止. 最后500ms内自动发送最后价格然后停止
function TimeDown() {
    if (!syncStart) {
        updateUI()
        console.log("sync had stop")
        return;
    }
    notifySyncData()
    setTimeout(function () {
        TimeDown();
    }, 100)
}


function updateData(currentPrice,ownPrice,mode) {
    syncPrice = currentPrice
    myPrice = ownPrice
    appMode = mode
    autoCheck()
    updateUI()
}

// 更新UI显示
function updateUI() {
    document.getElementById("appModeText").innerText = appMode
    document.getElementById("currentPriceText").innerText = syncPrice
    document.getElementById("myPriceText").innerText = myPrice
    if (syncStart) {
        document.getElementById("appStatusText").innerText = "进行中"
    } else {
        document.getElementById("appStatusText").innerText = "已停止"
    }
}

function autoCheck() {
    //如果发送历史不等于我的价格说明,发送未成功(还需出去为0的情况初始化),这是需要等待而不是去重新发送
    if (sendPriceHistory != myPrice && sendPriceHistory != 0) {
        //检测是否发送历史的价格是否有用,无用的话需要重新发送
        //当前价格超过我的发送历史即是我发送的历史价格无用不需要等待 需要重新发送新的价格
        console.log("检测历史记录:",syncPrice,getSignalPrice(syncPrice)[1],sendPriceHistory,getSignalPrice(sendPriceHistory)[1])
        if (getSignalPrice(syncPrice)[1] > getSignalPrice(sendPriceHistory)[1]) {
            console.log("发送历史价格无用,需要重新发送")
        } else {
            //TODO 如果当前价格为发送历史说明我发送失败,这时页面上应该跳转出我发送失败了,这时需要停止程序,重新启动程序
            //发送历史价格还有需要等待
            console.log("已经发送了一个价格:",sendPriceHistory)
            return;
        }
    }

    console.log("syncPirce和myPrice:",syncPrice,getSignalPrice(syncPrice)[1],myPrice,getSignalPrice(myPrice)[1])
    if (getSignalPrice(syncPrice)[1] > getSignalPrice(myPrice)[1]) {
        if (appMode == "单价") {
            //发送
            var priceArray= new Array();
            priceArray=syncPrice.split("/");
            if (priceArray.length != 2) {
                syncStart = false
                alert("未知错误,停止自动报价")
                return
            }
            num = divfloat(parseFloat(priceArray[0]),parseFloat(priceArray[1]))
            num = Math.round(num*100)/100
            var preparePrice = parseFloat(priceArray[1])
            preparePrice = preparePrice + interval
            if (preparePrice > maxPrice) {
                syncStart = false
                alert("价格超过预期,停止自动报价")
                return;
            }
            var prepareTotalPrice = mulfloat(num,preparePrice)
            sendPriceHistory = prepareTotalPrice +"/"+preparePrice
            console.log("准备报价:",sendPriceHistory)
            notifySendPrice(preparePrice,prepareTotalPrice)
        } else {
            syncStart = false
            alert("未知模式类型,停止自动报价")
            return;
        }
    } else {
        console.log("当前价格和我的价格相同")
    }
}

function getSignalPrice(price) {
    var priceArray=price.split("/");
    if (priceArray.length != 2) {
        return -1,-1
    }
    return [parseFloat(priceArray[0]),parseFloat(priceArray[1])]
}