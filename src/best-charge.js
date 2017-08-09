const itemsDatbase = require("../src/items.js");
const promotionsDatbase = require("../src/promotions");

function printTotalList(details) {
  let print = '============= 订餐明细 =============\n';
  for (let item of details.itemsList) {
    print += item.name + ' x ' + item.count + ' = ' + item.price + '元\n';
  }
  if (details.total.saved !== 0) {
    print += '-----------------------------------\n使用优惠:\n' + details.total.type + '，省' + details.total.saved + '元\n';
  }
  print += '-----------------------------------\n总计：' + details.total.actualPay + '元\n' + '===================================';
  return print;
}

function buildTotalList(itemsList, total) {
  return {itemsList, total};
}

function countPromotions(itemsList, summary) {
  let promotions = promotionsDatbase.loadPromotions();
  let total = {};
  let type_1;
  let type_2 = 0;
  let name = [];
  for (let item_1 of itemsList) {
    for (let item_2 of promotions[1].items) {
      if (item_1.id === item_2) {
        type_2 += (item_1.price / 2) * item_1.count;
        name.push(item_1.name);
      }
    }
  }
  total.saved = type_2;
  total.type = promotions[1].type;
  let temp = '';
  for (let item of name) {
    if (name.indexOf(item) === 0) {
      temp += item;
    } else {
      temp += '，' + item;
    }
  }
  total.type += '(' + temp + ')';
  if (summary > 30) {
    type_1 = 6;
    if (type_1 > type_2) {
      total.saved = type_1;
      total.type = promotions[0].type;
    }
  }
  if (total.saved === 0) {
    total.type = '没有优惠';
  }
  total.actualPay = summary - total.saved;
  return total;
}

function countSummary(itemsList) {
  let sum = 0;
  for (let item of itemsList) {
    sum += item.price;
  }
  return sum;
}

function countEach(items) {
  let allItems = itemsDatbase.loadAllItems();
  let result = [];
  for (let item_1 of allItems) {
    for (let item_2 of items) {
      if (item_1.id === item_2.id) {
        let price = item_1.price * item_2.count;
        result.push({id: item_1.id, name: item_1.name, count: item_2.count, price});
      }
    }
  }
  return result;
}

function countItems(array) {
  let result = [];
  for (let item of array) {
    let count = 1;
    if (item.split('x').length > 1) {
      count = parseInt(item.split('x')[1]);
      item = item.split('x')[0].trim();
    }
    result.push({id: item, count});
  }
  return result;
}

function bestCharge(inputs) {
  let items = countItems(inputs);
  let itemsList = countEach(items);
  let summary = countSummary(itemsList);
  let total = countPromotions(itemsList, summary);
  let details = buildTotalList(itemsList, total);
  return  printTotalList(details);
}

module.exports = bestCharge;
