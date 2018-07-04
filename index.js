const Dotenv = require('dotenv');

Dotenv.config();

const D = require('debug')('all');
// const V = require('debug')('verbose');
const Twitter = require('twitter');
const Discord = require('discord.js');

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_TOKEN_SECRET,
});

const discordHook = new Discord.WebhookClient(process.env.VINDVEIL_ID, process.env.VINDVEIL_TOKEN);
if (discordHook != null) {
  D('APP: Discord Webhook connection established');
} else {
  D('APP: Discord Webhook initialization failed');
}

function executeHook(message) {
  D('APP: Sending message to Webhook');
  discordHook.send(message);
  D('APP: Sent message to webhook');
}

const stream = client.stream('statuses/filter', { follow: '854197529575137280' });
D('APP: Running');

stream.on('data', (event) => {
  if (event.retweeted_status == null && event.in_reply_to_status_id == null) {
    D('TWEET:NewTweetObj: %O', event);

    const embedLink = `https://twitter.com/${event.user.screen_name}/status/${event.id_str}`;
    D('TWEET:Embed: %S', embedLink);
    executeHook(embedLink);
  }
});

stream.on('error', (error) => {
  throw error;
});
