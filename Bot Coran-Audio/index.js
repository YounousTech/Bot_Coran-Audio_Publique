const Discord = require('discord.js');
const client = new Discord.Client();
const quranAPI = require('quran-api');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (msg) => {
  // Vérifie si le message commence par "/coran_audio"
  if (msg.content.startsWith('/coran_audio')) {
    // Récupère l'utilisateur
    const user = msg.author;
    // Envoie un message pour demander le choix du récitateur
    const recitators = await quranAPI.getReciters();
    const recitatorsList = recitators.map((recitator) => `${recitator.id}: ${recitator.name}`);
    const recitatorChoice = await getUserChoice(msg, user, 'Choisissez un récitateur :\n' + recitatorsList.join('\n'));
    // Envoie un message pour demander le choix de la sourate
    const suras = await quranAPI.getSurahs();
    const surasList = suras.map((sura) => `${sura.id}: ${sura.name}`);
    const suraChoice = await getUserChoice(msg, user, 'Choisissez une sourate :\n' + surasList.join('\n'));
    // Crée un salon vocal avec le nom de l'utilisateur
    const voiceChannel = await createVoiceChannel(msg.guild, user.username + ' - Coran');
    // Joue la sourate choisie par le récitateur choisi
    const stream = await quranAPI.getSurah(recitatorChoice, suraChoice);
    const dispatcher = voiceChannel.play(stream, { volume: 0.5 });
    dispatcher.on('finish', () => {
      voiceChannel.delete();
    });
  }
});

// Fonction pour demander à l'utilisateur de choisir parmi une liste d'options
async function getUserChoice(msg, user, optionsMessage) {
  const filter = (response) => {
    return response.author.id === user.id;
  };
  await msg.channel.send(optionsMessage);
  const collected = await msg.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] });
  return collected.first().content;
}

// Fonction pour créer un salon vocal dans le serveur
async function createVoiceChannel(guild, name) {
  const voiceChannel = await guild.channels.create(name, {
    type: 'voice',
    userLimit: 1,
  });
  return voiceChannel;
}

client.login('TOKEN-Bot');