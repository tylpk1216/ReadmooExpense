const messageID = '#message';
const loadingImgID = '#loading';
const reportID = '#report';

let $messagePanel = null;
let $loadingImg = null;
let $reportTable = null;

function showMessage(msg) {
    disableLoadingImg(true);
    $messagePanel.text(msg);
}

function disableLoadingImg(status) {
    if (status) {
        $loadingImg.hide();
    } else {
        $loadingImg.show();
    }
}

function clearTableRows() {
    $('tr').remove();
}

function getPageHTML() {
    showMessage('');
    disableLoadingImg(false);
    clearTableRows();

    chrome.tabs.executeScript(null, {
        file: "js/jquery.min.js"
    }, function() {
        if (chrome.runtime.lastError) {
            let errorMsg = chrome.runtime.lastError.message;
            showMessage('error : \n' + errorMsg);
        }

        chrome.tabs.executeScript(null, {
            file: "js/gethtml.js"
        }, function() {
            if (chrome.runtime.lastError) {
                let errorMsg = chrome.runtime.lastError.message;
                showMessage('error : \n' + errorMsg);
            }
        });
    });
}

function onWindowLoad() {
    $messagePanel = $(messageID);
    $loadingImg = $(loadingImgID);
    $reportTable = $(reportID);

    getPageHTML();
}

function getFormatExpense(expense) {
    let s = expense.toString();
    let ans = '';

    while (s.length > 0) {
        if ((s.length % 3) == 0) {
            if (ans != '') {
                ans += ',';
            }
        }
        ans += s.slice(0, 1);
        s = s.slice(1);
    }

    return ans;
}

function getMonthExpense(monthObj, year, month) {
    let sum = 0;
    let key = year.toString() + '-';
    if (month.toString().length == 1) {
        key += '0';
    }
    key += month.toString();

    if (monthObj[key]) {
        sum = monthObj[key];
    }

    return sum;
}

function renderReportTable(monthObj) {
    let today = new Date();
    let nowYear = today.getFullYear();
    let max = 5;

    let s = '<tr class="tableHeader">';
    s += '<td>&nbsp;&nbsp;</td>';
    for (let i = 0; i < max; i++) {
        s += '<td class="centerData">' + (nowYear - i).toString() + '</td>';
    }
    s += '</tr>';
    $reportTable.append(s);

    let yearsSum = Array(max).fill(0);

    for (let month = 1; month <= 12; month++) {
        s = '<tr>';
        s += '<td class="month">' + month.toString() + '</td>';
        for (let i = 0; i < max; i++) {
            s += '<td class="leftData">';
            let monthExpense = getMonthExpense(monthObj, nowYear - i, month);
            yearsSum[i] += monthExpense;
            s += getFormatExpense(monthExpense);
            s += '</td>';
        }
        s += '</tr>';
        $reportTable.append(s);
    }

    s = '<tr class="yearSum">';
    s += '<td class="centerData">Total</td>';
    for (let i = 0; i < max; i++) {
        s += '<td class="leftData">' + getFormatExpense(yearsSum[i]) + '</td>';
    }
    s += '</tr>';
    $reportTable.append(s);
}

function processReport(items) {
    let monthObj = [];
    for (let i = 0; i < items.length; i++) {
        let dateStr = items[i].purchase_date.slice(0, 7);
        if (!monthObj[dateStr]) {
            monthObj[dateStr] = items[i].price;
        } else {
            monthObj[dateStr] += items[i].price;
        }
    }

    renderReportTable(monthObj);

    disableLoadingImg(true);
}

chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action == "getSource") {
        if (Array.isArray(request.source)) {
            processReport(request.source);
        } else {
            showMessage(request.source);
        }
    }
});

window.onload = onWindowLoad;