console.log("external javascript is working");
//document loading
const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'short',
    timeStyle: 'short'
});
document.addEventListener('DOMContentLoaded', async function () {
    await loadGroups();
    await loadItems();
    addButtonEvents();
});

async function loadGroups() {
    let response = null;
    try {
        response = await fetch('/inventory/group');
        console.log(response)
    }
    catch {
        console.log("fetch items failed");
        return;
    }
    if (!response)
        return;
    let groups = await response.json();
    groups = JSON.parse(groups);

    console.log(groups);

    groups.forEach((group) => {
        buildGroupDisplay(group);
    });
}

function buildGroupDisplay(){

}

async function loadItems() {
    //call item get API
    //fetch get requires correct headers i.e. cors, content type etc.
    let response = null;
    try {
        response = await fetch('/inventory/item');
    }
    catch {
        console.log("fetch items failed");
        return;
    }
    if (!response)
        return;
    let items = await response.json();
    items = JSON.parse(items);
    items.forEach((element) => {
        buildItemDisplay(element);
    });
}

function buildItemsGrid(items) {

}

function addButtonEvents() {
    const groupAddBtn = document.getElementById('group-add');
    const groupModalContainer = document.getElementById('group-modal-container');
    const groupSaveBtn = document.getElementById('group-modal-save');
    const groupCancelBtn = document.getElementById('group-modal-cancel');
    groupAddBtn?.addEventListener('click', () => {
        groupModalContainer?.classList.add('show');
    });
    groupCancelBtn?.addEventListener('click', () => {
        // clear modal here
        groupModalContainer?.classList.remove('show');
    });
    groupSaveBtn?.addEventListener('click', () => {
        // save data here
        saveGroupModal();
        groupModalContainer?.classList.remove('show');
    });
}

async function saveGroupModal() {
    // gather data
    let groupName = document.getElementById('group-input-name').value;
    let groupCategory = document.getElementById('group-input-category').value;
    let groupDescription = document.getElementById('group-input-description').value;
    let group = {
        name: groupName,
        description: groupDescription,
        category:  groupCategory
    }
    // POST
    let response = await fetch('/inventory/group/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(group)
    });

    
    

}

function buildItemDisplay(item) {
    console.log(item);
    const itemsGrid = document.getElementById("items-grid");
    //top level box container
    let display = document.createElement("div");
    display.setAttribute("class", "item-display");
    //html elements containing data
    //add name as separate div
    let name = document.createElement("h3");
    name.setAttribute("class", "item-name");
    name.innerHTML = item.fields.name;
    display.appendChild(name);
    let image = document.createElement("img");
    image.setAttribute("class", "item-img");
    image.setAttribute("src", defaultImage);
    display.appendChild(image);
    let description = document.createElement("p");
    description.setAttribute("class", "item-description");
    description.innerHTML = item.fields.description;
    let topTable = document.createElement("table");
    topTable.setAttribute("class", "item-top-table");
    let numberTable = document.createElement("table");
    numberTable.setAttribute("class", "key-value-table");
    insertFieldAsRow("price:", item.fields.price, numberTable);
    insertFieldAsRow("total:", item.fields.total_quantity, numberTable);
    insertFieldAsRow("available:", item.fields.available_quantity, numberTable);
    insertFieldAsRow("used:", item.fields.used_quantity, numberTable);
    let row = topTable.insertRow();
    row.insertCell().appendChild(numberTable);
    row.insertCell().appendChild(description);
    display.appendChild(topTable);
    itemsGrid?.appendChild(display);
}
;
function insertFieldAsRow(key, value, table) {
    const row = table.insertRow();
    row.insertCell().innerHTML = key;
    row.insertCell().innerHTML = value;
}
;
function getItemDateTable(item) {
    let dateTable = document.createElement("table");
    dateTable.setAttribute("class", "key-value-table");
    const updated = new Date(item.fields.updated_dt);
    insertFieldAsRow("updated", shortDateFormatter.format(updated), dateTable);
    const acquired = new Date(item.fields.acquired_dt);
    insertFieldAsRow("acquired", shortDateFormatter.format(acquired), dateTable);
    const expire = new Date(item.fields.expire_dt);
    insertFieldAsRow("expires", shortDateFormatter.format(expire), dateTable);
    insertFieldAsRow("lifespan", item.fields.lifespan, dateTable);
    return dateTable;
}
;
export {};
//export
//load data and display
//button actions
//events
