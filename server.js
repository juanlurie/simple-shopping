const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const DATA_FILE = path.join(__dirname, 'data', 'data.json');

const MASTER_CATALOG = [
  { name: 'Apples', category: 'produce' },
  { name: 'Bananas', category: 'produce' },
  { name: 'Oranges', category: 'produce' },
  { name: 'Grapes', category: 'produce' },
  { name: 'Strawberries', category: 'produce' },
  { name: 'Lettuce', category: 'produce' },
  { name: 'Tomatoes', category: 'produce' },
  { name: 'Cucumber', category: 'produce' },
  { name: 'Carrots', category: 'produce' },
  { name: 'Onions', category: 'produce' },
  { name: 'Potatoes', category: 'produce' },
  { name: 'Avocado', category: 'produce' },
  { name: 'Lemons', category: 'produce' },
  { name: 'Broccoli', category: 'produce' },
  { name: 'Spinach', category: 'produce' },
  { name: 'Bell Peppers', category: 'produce' },
  { name: 'Corn', category: 'produce' },
  { name: 'Watermelon', category: 'produce' },
  { name: 'Milk', category: 'dairy' },
  { name: 'Cheese', category: 'dairy' },
  { name: 'Yogurt', category: 'dairy' },
  { name: 'Butter', category: 'dairy' },
  { name: 'Eggs', category: 'dairy' },
  { name: 'Cream', category: 'dairy' },
  { name: 'Cheddar', category: 'dairy' },
  { name: 'Mozzarella', category: 'dairy' },
  { name: 'Chicken', category: 'meat' },
  { name: 'Ground Beef', category: 'meat' },
  { name: 'Bacon', category: 'meat' },
  { name: 'Salmon', category: 'meat' },
  { name: 'Deli Meat', category: 'meat' },
  { name: 'Sausages', category: 'meat' },
  { name: 'Bread', category: 'bakery' },
  { name: 'Bagels', category: 'bakery' },
  { name: 'Rolls', category: 'bakery' },
  { name: 'Tortillas', category: 'bakery' },
  { name: 'Cookies', category: 'bakery' },
  { name: 'Muffins', category: 'bakery' },
  { name: 'Chips', category: 'snacks' },
  { name: 'Crackers', category: 'snacks' },
  { name: 'Trail Mix', category: 'snacks' },
  { name: 'Granola Bars', category: 'snacks' },
  { name: 'Chocolate', category: 'snacks' },
  { name: 'Popcorn', category: 'snacks' },
  { name: 'Pretzels', category: 'snacks' },
  { name: 'Nuts', category: 'snacks' },
  { name: 'Water Bottles', category: 'drinks' },
  { name: 'Juice', category: 'drinks' },
  { name: 'Soda', category: 'drinks' },
  { name: 'Coffee', category: 'drinks' },
  { name: 'Beer', category: 'drinks' },
  { name: 'Wine', category: 'drinks' },
  { name: 'Iced Tea', category: 'drinks' },
  { name: 'Lemonade', category: 'drinks' },
  { name: 'Ice Cream', category: 'frozen' },
  { name: 'Frozen Pizza', category: 'frozen' },
  { name: 'Frozen Veggies', category: 'frozen' },
  { name: 'Ice', category: 'frozen' },
  { name: 'Waffles', category: 'frozen' },
  { name: 'Popsicles', category: 'frozen' },
  { name: 'Paper Plates', category: 'household' },
  { name: 'Paper Towels', category: 'household' },
  { name: 'Napkins', category: 'household' },
  { name: 'Trash Bags', category: 'household' },
  { name: 'Aluminum Foil', category: 'household' },
  { name: 'Ziploc Bags', category: 'household' },
  { name: 'Sunscreen', category: 'household' },
  { name: 'Bug Spray', category: 'household' },
  { name: 'Soap', category: 'household' },
  { name: 'Toilet Paper', category: 'household' },
  { name: 'Sunscreen', category: 'beach' },
  { name: 'Beach Towels', category: 'beach' },
  { name: 'Beach Umbrella', category: 'beach' },
  { name: 'Cooler', category: 'beach' },
  { name: 'Beach Toys', category: 'beach' },
  { name: 'Flip Flops', category: 'beach' },
  { name: 'Sunglasses', category: 'beach' },
];

let lists = {};
let currentListKey = 'default';
let itemFrequency = {};

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      lists = data.lists || {};
      currentListKey = data.currentListKey || 'default';
      itemFrequency = data.itemFrequency || {};
      if (!lists[currentListKey] || lists[currentListKey].items.length === 0) {
        lists[currentListKey] = getDefaultList();
      }
    } else {
      lists = { default: getDefaultList() };
    }
    rebuildFrequency();
    saveData();
  } catch (e) {
    lists = { default: getDefaultList() };
    rebuildFrequency();
    saveData();
  }
}

function rebuildFrequency() {
  itemFrequency = {};
  for (const list of Object.values(lists)) {
    for (const item of list.items) {
      const key = item.name.toLowerCase();
      itemFrequency[key] = (itemFrequency[key] || 0) + 1;
    }
  }
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ lists, currentListKey, itemFrequency }, null, 2));
}

function getDefaultList() {
  return {
    name: 'Beach Trip',
    items: [
      { name: 'Sunscreen', category: 'beach', checked: false, qty: 1 },
      { name: 'Beach Towels', category: 'beach', checked: false, qty: 1 },
      { name: 'Water Bottles', category: 'drinks', checked: false, qty: 1 },
      { name: 'Chips', category: 'snacks', checked: false, qty: 1 },
      { name: 'Bread', category: 'bakery', checked: false, qty: 1 },
      { name: 'Cheese', category: 'dairy', checked: false, qty: 1 },
      { name: 'Apples', category: 'produce', checked: false, qty: 1 },
      { name: 'Bananas', category: 'produce', checked: false, qty: 1 },
      { name: 'Ice Cream', category: 'frozen', checked: false, qty: 1 },
      { name: 'Paper Plates', category: 'household', checked: false, qty: 1 },
      { name: 'Bug Spray', category: 'household', checked: false, qty: 1 },
      { name: 'Beach Toys', category: 'beach', checked: false, qty: 1 },
      { name: 'Ice', category: 'frozen', checked: false, qty: 1 },
      { name: 'Juice', category: 'drinks', checked: false, qty: 1 },
      { name: 'Trail Mix', category: 'snacks', checked: false, qty: 1 },
    ]
  };
}

function getAllKnownItems() {
  const items = {};
  for (const item of MASTER_CATALOG) {
    const key = item.name.toLowerCase();
    if (!items[key]) {
      items[key] = { name: item.name, category: item.category, freq: itemFrequency[key] || 0 };
    }
  }
  for (const list of Object.values(lists)) {
    for (const item of list.items) {
      const key = item.name.toLowerCase();
      if (!items[key]) {
        items[key] = { name: item.name, category: item.category || 'other', freq: itemFrequency[key] || 0 };
      }
    }
  }
  return Object.values(items).sort((a, b) => b.freq - a.freq);
}

loadData();

app.use(express.static(path.join(__dirname)));

app.get('/api/lists', (req, res) => {
  res.json({ lists, currentListKey });
});

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({
    type: 'init',
    lists,
    currentListKey,
    itemFrequency,
    knownItems: getAllKnownItems()
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'add_item': {
          const item = data.item;
          lists[currentListKey].items.push({ ...item, qty: item.qty || 1 });
          const key = item.name.toLowerCase();
          itemFrequency[key] = (itemFrequency[key] || 0) + 1;
          saveData();
          broadcast({ type: 'update', lists, currentListKey, itemFrequency, knownItems: getAllKnownItems() });
          break;
        }

        case 'toggle_item':
          lists[currentListKey].items[data.index].checked = !lists[currentListKey].items[data.index].checked;
          saveData();
          broadcast({ type: 'update', lists, currentListKey, itemFrequency, knownItems: getAllKnownItems() });
          break;

        case 'delete_item':
          lists[currentListKey].items.splice(data.index, 1);
          saveData();
          broadcast({ type: 'update', lists, currentListKey, itemFrequency, knownItems: getAllKnownItems() });
          break;

        case 'set_qty':
          lists[currentListKey].items[data.index].qty = data.qty;
          saveData();
          broadcast({ type: 'update', lists, currentListKey, itemFrequency, knownItems: getAllKnownItems() });
          break;

        case 'clear_checked':
          lists[currentListKey].items = lists[currentListKey].items.filter(i => !i.checked);
          saveData();
          broadcast({ type: 'update', lists, currentListKey, itemFrequency, knownItems: getAllKnownItems() });
          break;

        case 'clear_all':
          lists[currentListKey].items = [];
          saveData();
          broadcast({ type: 'update', lists, currentListKey, itemFrequency, knownItems: getAllKnownItems() });
          break;

        case 'uncheck_all':
          lists[currentListKey].items.forEach(i => i.checked = false);
          saveData();
          broadcast({ type: 'update', lists, currentListKey, itemFrequency, knownItems: getAllKnownItems() });
          break;

        case 'duplicate_list': {
          const source = lists[currentListKey];
          const newKey = 'list_' + Date.now();
          lists[newKey] = {
            name: source.name + ' (Copy)',
            items: source.items.map(i => ({ ...i, checked: false }))
          };
          currentListKey = newKey;
          saveData();
          broadcast({ type: 'update', lists, currentListKey, itemFrequency, knownItems: getAllKnownItems() });
          break;
        }

        case 'rename_list':
          lists[currentListKey].name = data.name;
          saveData();
          broadcast({ type: 'update', lists, currentListKey, itemFrequency, knownItems: getAllKnownItems() });
          break;

        case 'switch_list':
          if (lists[data.key]) {
            currentListKey = data.key;
            saveData();
            broadcast({ type: 'update', lists, currentListKey, itemFrequency, knownItems: getAllKnownItems() });
          }
          break;

        case 'delete_list':
          if (Object.keys(lists).length > 1 && lists[data.key]) {
            delete lists[data.key];
            if (currentListKey === data.key) {
              currentListKey = Object.keys(lists)[0];
            }
            saveData();
            broadcast({ type: 'update', lists, currentListKey, itemFrequency, knownItems: getAllKnownItems() });
          }
          break;
      }
    } catch (e) {
      console.error('Error processing message:', e);
    }
  });
});

function broadcast(message) {
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Shopping list server running on http://0.0.0.0:${PORT}`);
});
