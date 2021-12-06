const Discord = require("discord.js");
const { MessageEmbed } = require("discord.js");
const client = new Discord.Client({ ws: { intents: Discord.Intents.ALL } });
const TwitchAPI = require("node-twitch").default;
const {
  streamer,
  guildID,
  roleID,
  appClientID,
  activitiesList,
  appSecretToken,
  token
} = require("./config.json");

const chalk = require("chalk");

const error = chalk.bold.red;
const warning = chalk.hex("#FFA500"); // Orange
const success = chalk.bold.green;
const note = chalk.bold.blue;
const normal = chalk.bold.white;
const waiting = chalk.bold.yellowBright;

const twitch = new TwitchAPI({
  client_id: appClientID,
  client_secret: appSecretToken, // CHANGE LATER
});

let IsLiveMemory = false;

client.on("ready", () => {
  console.log(note(`Logged in as ${normal(client.user.tag)}!`));

  setInterval(() => {
    if (IsLiveMemory !== true) {
      const index = Math.floor(Math.random() * (activitiesList.length - 1) + 1);
      client.user.setActivity(activitiesList[index] + " | zioidk.com", {
        type: "PLAYING",
      });
    }
  }, 10 * 1000);
});

function sendDirectMessageToRole(r) {
  var guild = client.guilds.cache.get(guildID);

  const streamEmbed = new MessageEmbed()
    .setTitle(r.title)
    .setURL("https://twitch.tv/" + r.user_login)
    .setAuthor(
      r.user_name,
      "https://static-cdn.jtvnw.net/jtv_user_pictures/b4a0dbe8-f936-4a38-be36-aae6550c19ab-profile_image-300x300.png",
      "https://twitch.tv/" + r.user_login
    )
    .setColor(0x00ae86)
    .setDescription(`${r.user_name} is playing ${r.game_name} on Twitch!`)
    .setFooter(
      "Twitch",
      "https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png"
    )
    .setThumbnail(
      `https://static-cdn.jtvnw.net/previews-ttv/live_user_${r.user_login}-1920x1080.jpg`
    )
    .setTimestamp();

  guild.roles.cache
    .get(roleID)
    .members.forEach((member) => member.send(streamEmbed));
}

const run = async function Run() {
  await twitch
    .getStreams({
      channel: streamer,
    })
    .then(async (data) => {
      const r = data.data[0];

      if (r !== undefined) {
        if (r.type === "live") {
          console.log(success("◍ ") + normal(` ${streamer} is currently live.`));
          if (IsLiveMemory === false || IsLiveMemory === undefined) {
            // And we are live...
            console.log(data);
            IsLiveMemory = true;

            sendDirectMessageToRole(r);
            client.user.setActivity(`LIVE on twitch.tv/${streamer}`, {
              type: "STREAMING",
              url: "https://www.twitch.tv/" + streamer,
            });
          }
        } else {
          console.log(
            error("◍ ") +
              normal(` ${streamer} stopped streaming. Until next time!`)
          );
          if (IsLiveMemory === true) {
            // Streamer stopped streaming
            IsLiveMemory = false;
            console.log(
              warning("Couldn't detect stream, assuming stream went offline.")
            );
          }
        }
      } else {
        if (IsLiveMemory === true) {
          // Something went wrong.. we couldn't find any data.
          IsLiveMemory = false;
          console.log(error("Could not find any data about stream!"));
        } else {
        }
      }
    });
};
setInterval(run, 15 * 1000); // Every 15 seconds, the function checks if streamer is live.

client.login(token);
