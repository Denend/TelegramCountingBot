const TelegramBot = require('node-telegram-bot-api');
// replace the value below with the Telegram token you receive from @BotFather
const token = '*********************************************';
const bot = new TelegramBot(token, {polling: true});
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb';

const dbName = 'banki_beerDB';

//let weekAgo = currDate.setDate(currDate.getDate()-7)
//let formatedDateWeekAgo = new Date(weekAgo)

//console.log(formatedDateWeekAgo);
//console.log(now>formatedDateWeekAgo);
function calculateWeekAgo(){
  const now = new Date();
  const currDate = new Date();
  //let formatedDate = new Date(msg.date*1000);
  let diff = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1);
  //console.log(diff);
  let atTheBeginingOf = new Date(now.setDate(diff));
  return now;
}
function isPositiveInteger(s) {
  return /^\+?[1-9][\d]*$/.test(s);
}


// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  const db = client.db(dbName);


  //client.close();
  function showConsumedNumber(collection,msgChatId,callback){
    console.log("started");
    let beersDrunk = 0;
    const myCollection = db.collection(collection);
    myCollection.find().toArray(function(err,res){           //Why the fuck is it a promise;
      if(err){
        throw err;
      } else {
        res.forEach(function(r){
          if(new Date(r.date*1000)>calculateWeekAgo()&&r.chatId==msgChatId){
            beersDrunk = beersDrunk + parseInt(r.consumed)
          }

        });
        console.log(beersDrunk);
      }
      callback(beersDrunk);
    });
  };
  //chat id = 305465575
  //showConsumedNumber("greenStuff","305465575");

  //---------------------------------- up there is a db
  bot.onText(/\/beers (.+)/i, (msg, match) => {
    let collection = db.collection("alcohol");
    const chatId = msg.chat.id;
    const resp = "you just drank "+match[1]+" beers";
    const beerQuant = match[1];
    const name = msg.chat.first_name;
    console.log(match);
    if(isPositiveInteger(beerQuant)){
      collection.insertOne({"chatId":chatId,"name":name,"date":msg.date,"consumed":beerQuant});
    } else {
      resp = "a sign after beers should be an integer"
    }
    bot.sendMessage(chatId, resp);
  });


  bot.onText(/\/banki (.+)/i, (msg, match) => {
    let collection = db.collection("greenStuff");
    const resp = "Nice, you just did "+match[1]+" banok";
    const chatId = msg.chat.id;
    const bankiQuant = match[1];
    const name = msg.chat.first_name;
    if(isPositiveInteger(bankiQuant)){
      collection.insertOne({"chatId":chatId,"name":name,"date":msg.date,"consumed":bankiQuant});
    } else {
      resp = "a sign after banki should be an integer";
    }
    //console.log(match);
    bot.sendMessage(chatId, resp);
  });

  bot.onText(/\/vodka (.+)/i, (msg, match) => {
    let collection = db.collection("vodka");
    const resp = "you just drank "+match[1]+"g of vodka";
    const chatId = msg.chat.id;
    const vodkaQuant = match[1];
    const name = msg.chat.first_name;
    if(isPositiveInteger(vodkaQuant)){
      collection.insertOne({"chatId":chatId,"name":name,"date":msg.date,"consumed":vodkaQuant});
    } else {
      resp = "a sign after vodka should be an integer";
    }
    //console.log(match);
    bot.sendMessage(chatId, resp);
  });


  bot.onText(/\/beersThisWeek/i, (msg, match) => {
      const chatId = msg.chat.id;
      showConsumedNumber("alcohol",chatId, function(beersPerWeek){
        const resp = "you drank "+beersPerWeek+" beers this week";
        console.log(beersPerWeek);
        bot.sendMessage(chatId, resp);
      });

  });
  bot.onText(/\/banokThisWeek/i, (msg, match) => {
    const chatId = msg.chat.id;
    showConsumedNumber("greenStuff",chatId,function(banokPerWeek){
      console.log(banokPerWeek);
      const resp = "you did "+ banokPerWeek +" banki";
      bot.sendMessage(chatId, resp);
    })

  });

  bot.onText(/\/vodkaThisWeek/i, (msg, match) => {
    const chatId = msg.chat.id;
    showConsumedNumber("vodka",chatId,function(vodkiPerWeek){
      const resp = "you drank "+ vodkiPerWeek +" of vodka this week";
      bot.sendMessage(chatId, resp);
    })
  });

  bot.onText(/\/start/i, (msg, match) => {
    const chatId = msg.chat.id;

      const resp = `Feel free to use the following commands:
/beers <Number> - records the number of beers drunk(o.5 L = 1 beer)
/vodka <Number> - records gramms of vodka you drank
/banki <Number> - records the number of puffs smoked
/banokThisWeek - shows your weekly puff score
/vodkaThisWeek - shows vodka weekly score in gramms
/beersThisWeek - shows your weekly beer score`
      bot.sendMessage(chatId, resp);

  });


  // Listen for any kind of message. There are different kinds of
  // Notes: the only thing is to write script which filters beers by a date; then specify an alcohol;



  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, 'Received your message');
  });
});
