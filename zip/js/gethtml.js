var pageCount = 0;
var totalPage = -1;
var records = [];

function processData(source) {
    pageCount = 0;
    totalPage = 1;
    records = [];

    let regex = /<select class=\"pagination-jump\"><option.*>(\d)<\/option><\/select>/g;
    while((info = regex.exec(source)) != null) {
        totalPage = parseInt(info[1]);
    }

    // always do one time query.
    /*
    if (totalPage == -1 || totalPage == 0) {
        sendResultMessage('no purchase records');
        return;
    }
    */

    getSinglePageData(pageCount+1);

    /*
    for (let i = 1; i <= totalPage; i++) {
        setTimeout(function() {
            let page = i;
            getSinglePageData(page);
        }, 1200);
    }
    */
}

function sendResultMessage(msg) {
    chrome.runtime.sendMessage({
        action: "getSource",
        source: msg,
        url: document.URL
    });
}

function sendProgresstMessage(msg) {
    chrome.runtime.sendMessage({
        action: "progress",
        source: msg,
        url: document.URL
    });
}

function ignoreThisRecord(item) {
    if (g_ignored) {
        if (item.pay_type == '犢幣') return true;
    }

    return false;
}

function getSinglePageData(page) {
    let progressMsg = 'progress : ' + page.toString() + ' / ' + totalPage.toString();
    sendProgresstMessage(progressMsg);

    let formData = new FormData();

    formData.append('order_by_type', "desc");
    formData.append('pagenumber', page.toString());

    $.ajax({
        url: 'https://member.readmoo.com/order/get_order_records',
        type: 'POST',
        timeout: 60000,
        data : formData,
        processData: false,
        contentType: false,
        success: function(data, result) {
            if (!data || !data.data_set_list) {
                sendResultMessage('readmoo responses no data');
                return;
            }

            /* the element in data_set_list array
            {
              "sn": "xxxx",
              "uid": "xxxx",
              "type": "0",
              "deal_type": "0",
              "pay_type": "信用卡（智付通）",
              "pay_id": null,
              "price": 843,
              "original_price": "843.00",
              "coupon_id": "xxxx",
              "relation_order_id": "0",
              "initial_order_id": "0",
              "songmoon_id": "0",
              "shipping_zone": "0",
              "tax": null,
              "hidden": "0",
              "status": "1",
              "pay_status": "付款完成",
              "ship_status": "0",
              "invoice_status": "1",
              "refund_status": "0",
              "refund_type": "0",
              "memo": null,
              "delete": "0",
              "pay_time": "2018-12-28 18:04:30",
              "refund_time": null,
              "create_time": "2018-12-28 18:03:52",
              "updated_time": "2018-12-28 18:04:32",
              "serial": 17,
              "purchase_date": "2018-12-28",
              "order_id": "AAA",
              "order_url": "https://member.readmoo.com/order/detail/AAA"
            }
            */
            for (let i = 0; i < data.data_set_list.length; i++) {
                if (ignoreThisRecord(data.data_set_list[i])) continue;

                records.push(data.data_set_list[i]);
            }

            pageCount++;
            if (pageCount == totalPage) {
                sendResultMessage(records);
                return;
            }

            getSinglePageData(pageCount+1);
        },
        error: function(xhr, textStatus, message) {
            sendResultMessage(message);
        }
    });
}

processData(document.documentElement.innerHTML);