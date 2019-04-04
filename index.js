const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = '842870644:AAGKNzgAygQuFHbqeiouCOgJ03OXgDF_eFw';
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


// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  const db = client.db(dbName);


  //client.close();
  function showConsumedNumber(collection){
    //show quantity of something consumed this week
    console.log("started");
    let beersDrank = 0;
    const db = client.db(dbName);
    const myCollection = db.collection(collection);
    myCollection.find().toArray(function(err,res){           //Why the fuck is it a promise;
      if(err){
        throw err;
        //console.log(res)
      } else {
        res.forEach(function(r){
          if(new Date(r.date*1000)>calculateWeekAgo()){
            beersDrank = beersDrank + parseInt(r.consumed)
          }
        });
        console.log(beersDrank);
        return beersDrank;

      }
    });
    //return beersDrank;
  };
  showConsumedNumber("alcohol");

  //---------------------------------- up there is a db
  bot.onText(/\/beers (.+)/, (msg, match) => {
    let collection = db.collection("alcohol");
    const chatId = msg.chat.id;
    const resp = "you drank "+match[1]+" beers";
    const beerQuant = match[1];
    const name = msg.chat.first_name;
    console.log(match);
    collection.insertOne({"chatId":chatId,"name":name,"date":msg.date,"consumed":beerQuant});
    bot.sendMessage(chatId, resp);
  });


  bot.onText(/\/banki (.+)/, (msg, match) => {
    let collection = db.collection("greenStuff");
    const resp = "Nice, you just did "+match[1]+" banok";
    const chatId = msg.chat.id;
    const bankiQuant = match[1];
    const name = msg.chat.first_name;
    //console.log(match);
    collection.insertOne({"chatId":chatId,"name":name,"date":msg.date,"consumed":bankiQuant});
    //console.log(match);
    bot.sendMessage(chatId, resp);
  });


  bot.onText(/\/beersThisWeek/, (msg, match) => {
    let beersStat = showConsumedNumber("alcohol");
    let myCollection = db.collection()
    const resp = "you did "+beersStat+" banki";
    const chatId = msg.chat.id;
    //console.log(match);
    bot.sendMessage(chatId, resp);
  });
  bot.onText(/\/banokThisWeek/, (msg, match) => {
    let banokStat = showConsumedNumber("greenStuff");
    const resp = "you did "+ banokStat +" banki";
    const chatId = msg.chat.id;
    //console.log(match);
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
