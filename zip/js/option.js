function save_options() {
    console.log('save_options');
    var ignored = document.getElementById('Ignored').checked;
    chrome.storage.sync.set({
        ignored: ignored
    }, function() {
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

function handleClick() {
    console.log('click');
    save_options();   
}

function restore_options() {
    chrome.storage.sync.get({
        ignored: true
    }, function(items) {
        document.getElementById('Ignored').checked = items.ignored;
        document.getElementById('Notignored').checked = !items.ignored;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);