var syncStart = false
var localDate = 0
var oldTime = 0
var oldPrice = 0
//notifySyncData()

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(tab.id, {file: 'jquery.min.js'});
    chrome.tabs.executeScript(tab.id, {file: 'content.js'});
});

$(function(){
    var state = $('#state');
    $('#startSync').click(function () {//给对象绑定事件
        startSync()
    });
    $('#stopSync').click(function () {//给对象绑定事件
        stopSync()
    });
    $('#singleSend').click(function () {
        console.log("start to send")
        notifySendPrice()
    })
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
}

//通知contentScript 向目标界面发送最后价格
function notifySendPrice() {
    chrome.tabs.query({active:true, currentWindow:true}, function (tab) {//获取当前tab
        //向tab发送请求
        chrome.tabs.sendMessage(tab[0].id, {
            action: "start",
        }, function (response) {
            console.log(response);
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
            updateData(response.lastTime,response.currentPrice)
            updateUI()
        });
    });
}

//定时器, 1ms执行一次. 时间消耗完或主动暂停时停止. 最后500ms内自动发送最后价格然后停止
function TimeDown() {
    if (!syncStart || localDate <= 0) {
        console.log("sync had stop")
        return;
    }

    if (localDate < 700) {
        notifySendPrice()
        console.log("sync had stop")
        alert("发送成功")
        return;
    }
    notifySyncData()
    localDate -= 1
    //延迟一秒执行自己
    setTimeout(function () {
        TimeDown();
    }, 1)
}

//更新本地数据,价格是多少就是多少.
// 由于服务器时间(syncTime)可能和本地时间不同因此本地时间需更新为服务器时间. 如果服务器时间并未更新的话,本地时间还是正常倒计时.
// TODO: 由于网络延时的原因收到的服务器时间小于本地时间,因此本地时间 = 收到的服务器时间+时延. 时延目前猜测大于在20~50ms间,因此需要进行本地时间的更新需要加入时间目前并未做
function updateData(syncTime,syncPrice) {
    if (oldTime == 0) {
        oldTime = syncTime
        localDate = syncTime
    } else if (oldTime == syncTime){
        return;
    } else if (localDate == syncTime) {
        return;
    } else if (localDate > syncTime) {
        console.log("localDate > syncTime :",localDate-syncTime)
        oldTime = syncTime
        localDate = syncTime
    } else if (localDate < syncTime) {
        console.log("localDate < syncTime :",localDate-syncTime)
        oldTime = syncTime
        localDate = syncTime
    }
    oldPrice = syncPrice
}

// 更新UI显示
function updateUI() {
    document.getElementById("currentTimeText").innerText = localDate
    document.getElementById("currentPriceText").innerText = oldPrice
}