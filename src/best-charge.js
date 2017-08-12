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

function promotionType(itemsList, promotions) {
  let saved = 0;
  let name = [];
  for (let itemOne of itemsList) {
    for (let itemTwo of promotions[1].items) {
      if (itemOne.id === itemTwo) {
        saved += (itemOne.price / 2) * itemOne.count;
        name.push(itemOne.name);
      }
    }
  }
  return {saved, type: promotions[1].type + '(' + name.join('，') + ')'};
}

function countPromotions(itemsList, summary) {
  let promotions = promotionsDatbase.loadPromotions();
  let total = promotionType(itemsList, promotions);
  if (summary > 30) {
    if (total.saved < 6) {
      total.saved = 6;
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
  return items.map((itemOne) => {
    let itemTwo = allItems.find((item) => {
      return itemOne.id === item.id;
    });
    return {id: itemOne.id, name: itemTwo.name, count: itemOne.count, price: itemTwo.price * itemOne.count};
  });
}

function countItems(array) {
  return array.map((item) => {
    let count = 1;
    let itemSplit = item.split('x');
    if (itemSplit.length > 1) {
      count = parseInt(itemSplit[1]);
      item = itemSplit[0].trim();
    }
    return {id: item, count};
  });
}

function bestCharge(inputs) {
  let items = countItems(inputs);
  let itemsList = countEach(items);
  let summary = countSummary(itemsList);
  let total = countPromotions(itemsList, summary);
  let details = buildTotalList(itemsList, total);
  return printTotalList(details);
}

module.exports = bestCharge;
