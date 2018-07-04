const Dotenv = require('dotenv');

Dotenv.config();

const A = require('debug')('debug:app');
const T = require('debug')('debug:tweet');
const Twitter = require('twitter');
const Discord = require('discord.js');

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_TOKEN_SECRET,
});

const discordHook = new Discord.WebhookClient(process.env.HOOK_ID, process.env.HOOK_TOKEN);

function executeHook(message) {
  A('Sending message to Webhook');
  discordHook.send(message);
  A('Sent message to webhook');
}

const followIDs = process.env.TWITTER_IDS.split(' ').join(',');
A('Watching Twitter IDs %s', followIDs);

const stream = client.stream('statuses/filter', { follow: followIDs });
A('Running');

stream.on('data', (event) => {
  if (event.retweeted_status == null
    && event.in_reply_to_status_id == null
    && event.in_reply_to_user_id) {
    T('NewTweetObj: %O', event);

    const embedLink = `https://twitter.com/${event.user.screen_name}/status/${event.id_str}`;
    T('Embed: %s', embedLink);
    executeHook(embedLink);
  }
});

stream.on('error', (error) => {
  throw error;
});
