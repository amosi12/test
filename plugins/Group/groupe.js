const { bmbtz } = require("../../devbmb/bmbtz")
//const { getGroupe } = require("../../lib/groupe")
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const {ajouterOuMettreAJourJid,mettreAJourAction,verifierEtatJid} = require("../../lib/antilien")
const {atbajouterOuMettreAJourJid,atbverifierEtatJid} = require("../../lib/antibot")
const { search, download } = require("aptoide-scraper");
const fs = require("fs-extra");
const conf = require("../../settings");
const { default: axios } = require('axios');
//const { uploadImageToImgur } = require('../../devbmb/imgur');





bmbtz({ nomCom: "tagall", categorie: 'Group', reaction: "📣" }, async (dest, client, commandeOptions) => {

  const {
    ms,
    repondre,
    arg,
    verifGroupe,
    nomGroupe,
    infosGroupe,
    nomAuteurMessage,
    verifAdmin,
    superUser
  } = commandeOptions;

  if (!verifGroupe) {
    repondre("🚫 *This command is for group use only.*");
    return;
  }

  let mess = (!arg || arg === ' ') ? '🔔 No message provided.' : arg.join(' ');
  let membresGroupe = await infosGroupe.participants;

  let emoji = ['🦴', '👀', '😮‍💨', '❌', '✔️', '😇', '⚙️', '🔧', '🎊', '😡', '🙏🏿', '⛔️', '$', '😟', '🥵', '🐅'];
  let random = Math.floor(Math.random() * emoji.length);

  // Anza kujenga ki box kizuri
  let tag = 
`╭─────❰ *📣 GROUP TAG ALERT* ❱─────╮
│
│ 🏷️ *Group:* ${nomGroupe}
│ 👤 *By:* ${nomAuteurMessage}
│ 💬 *Message:* ${mess}
│
│ 👥 *Tagged Members:*
│────────────────────────────`;

  for (const membre of membresGroupe) {
    tag += `\n│ ${emoji[random]} @${membre.id.split("@")[0]}`;
  }

  tag += `\n╰────────────────────────────╯`;

  if (verifAdmin || superUser) {
    client.sendMessage(dest, {
      text: tag,
      mentions: membresGroupe.map((i) => i.id)
    }, { quoted: ms });
  } else {
    repondre("🚫 *Only group admins can use this command.*");
  }

});

bmbtz({ nomCom: "link", categorie: 'Group', reaction: "🙋" }, async (dest, client, commandeOptions) => {
  const { repondre, nomGroupe, nomAuteurMessage, verifGroupe } = commandeOptions;

  if (!verifGroupe) {
    repondre("😅 Wait bro, you want the link to my DM? This command is for *groups only*.");
    return;
  }

  var link = await client.groupInviteCode(dest);
  var lien = `https://chat.whatsapp.com/${link}`;

  let mess =
`╭───❰ *GROUP LINK REQUESTED* ❱───╮
│
│ 🙋 Hello *${nomAuteurMessage}*,
│ 🔗 Here is the link for group *${nomGroupe}*:
│
│ 👉 ${lien}
│
│ © B.M.B-TECH 𝐬𝐜𝐢𝐞𝐧𝐜𝐞
╰────────────────────────────╯`;

  repondre(mess);

});
/** *nommer un membre comme admin */
bmbtz({ nomCom: "promote", categorie: 'Group', reaction: "🔃" }, async (dest, client, commandeOptions) => {
  let { repondre, infosGroupe, verifGroupe, auteurMessage, superUser, idBot, utilisateur } = commandeOptions;
  let membresGroupe = verifGroupe ? await infosGroupe.participants : ""
  if (!verifGroupe) { return repondre("For groups only"); }

  const verifMember = (user) => {
    for (const m of membresGroupe) {
      if (m.id !== user) continue;
      else return true;
    }
  }

  const memberAdmin = (membresGroupe) => {
    let admin = [];
    for (m of membresGroupe) {
      if (m.admin == null) continue;
      admin.push(m.id);
    }
    return admin;
  }

  const a = verifGroupe ? memberAdmin(membresGroupe) : '';

  let admin = verifGroupe ? a.includes(utilisateur) : false;
  let membre = utilisateur ? verifMember(utilisateur) : false;
  let autAdmin = verifGroupe ? a.includes(auteurMessage) : false;
  let botAdmin = verifGroupe ? a.includes(idBot) : false;
  try {
    if (autAdmin || superUser) {
      if (utilisateur) {
        if (botAdmin) {
          if (membre) {
            if (admin == false) {
              var txt = `🎊🎊🎊  @${utilisateur.split("@")[0]} rose in rank.\n
                      he/she has been named group administrator.`
              await client.groupParticipantsUpdate(dest, [utilisateur], "promote");
              client.sendMessage(dest, { text: txt, mentions: [utilisateur] })
            } else { return repondre("This member is already an administrator of the group.") }

          } else { return repondre("This user is not part of the group."); }
        }
        else { return repondre("Sorry, I cannot perform this action because I am not an administrator of the group.") }

      } else { repondre("Tag or reply to the member you want to promote."); }
    } else { return repondre("Sorry I cannot perform this action because you are not an administrator of the group.") }
  } catch (e) { repondre("oups " + e) }

})

//fin nommer
/** ***demettre */

bmbtz({ nomCom: "demote", categorie: 'Group', reaction: "🔃" }, async (dest, client, commandeOptions) => {
  let { repondre, infosGroupe, verifGroupe, auteurMessage, superUser, idBot, utilisateur } = commandeOptions;
  let membresGroupe = verifGroupe ? await infosGroupe.participants : ""
  if (!verifGroupe) { return repondre("For groups only"); }

  const verifMember = (user) => {
    for (const m of membresGroupe) {
      if (m.id !== user) continue;
      else return true;
    }
  }

  const memberAdmin = (membresGroupe) => {
    let admin = [];
    for (m of membresGroupe) {
      if (m.admin == null) continue;
      admin.push(m.id);
    }
    return admin;
  }

  const a = verifGroupe ? memberAdmin(membresGroupe) : '';

  let admin = verifGroupe ? a.includes(utilisateur) : false;
  let membre = utilisateur ? verifMember(utilisateur) : false;
  let autAdmin = verifGroupe ? a.includes(auteurMessage) : false;
  let botAdmin = verifGroupe ? a.includes(idBot) : false;
  try {
    if (autAdmin || superUser) {
      if (utilisateur) {
        if (botAdmin) {
          if (membre) {
            if (admin == false) {

              repondre("This member is not a group administrator.")

            } else {
              var txt = `@${utilisateur.split("@")[0]} was removed from his position as a group administrator\n`
              await client.groupParticipantsUpdate(dest, [utilisateur], "demote");
              client.sendMessage(dest, { text: txt, mentions: [utilisateur] })
            }

          } else { return repondre("This user is not part of the group."); }
        }
        else { return repondre("Sorry I cannot perform this action because I am not an administrator of the group.") }

      } else { repondre("Tag or reply to the member you want to demote."); }
    } else { return repondre("Sorry I cannot perform this action because you are not an administrator of the group.") }
  } catch (e) { repondre("oups " + e) }

})


/** ***fin démettre****  **/
/** **retirer** */
bmbtz({ nomCom: "remove", aliases: ["kick"], categorie: 'Group', reaction: "🦵" }, async (dest, client, commandeOptions) => {
  let { repondre, verifGroupe, verifAdmin, superUser, idBot, utilisateur } = commandeOptions;

  if (!verifGroupe) { return repondre("for groups only"); }
  if (!(verifAdmin || superUser)) { return repondre("Sorry, I cannot perform this action because you are not an administrator of the group."); }

  const groupMetadata = await client.groupMetadata(dest);
  const participants = groupMetadata.participants;

  const admins = participants.filter((m) => m.admin != null).map((m) => m.id);
  const botIsAdmin = admins.includes(idBot);

  if (!botIsAdmin) { return repondre("Sorry, I cannot perform this action because I am not an administrator of the group."); }

  if (!utilisateur) { return repondre("Tag or reply to the member you want to remove."); }

  const isMember = participants.some((m) => m.id === utilisateur);
  if (!isMember) { return repondre("This user is not part of the group."); }

  if (admins.includes(utilisateur)) { return repondre("This member cannot be removed because he is an administrator of the group."); }

  if (utilisateur === idBot) { return repondre("I cannot remove myself."); }

  try {
    await client.groupParticipantsUpdate(dest, [utilisateur], "remove");
    await client.sendMessage(dest, {
      text: `╭───〔 🦵 MEMBER REMOVED 〕───\n│\n│ 👤 User: @${utilisateur.split("@")[0]}\n│\n│ ✅ Removed from group successfully\n│\n╰────────────────────`,
      mentions: [utilisateur]
    });
  } catch (e) {
    repondre("oups " + e);
  }
});


/** *****fin retirer */

bmbtz({
  nomCom: "del",
  categorie: 'Group',
  reaction: "🧹"
}, async (dest, client, commandeOptions) => {
  const {
    ms, repondre, verifGroupe,
    auteurMsgRepondu, idBot,
    msgRepondu, verifAdmin, superUser
  } = commandeOptions;

  if (!msgRepondu) return repondre("❗ *Please reply to the message you want to delete.*");

  // Case: If SuperUser deletes their own message
  if (superUser && auteurMsgRepondu === idBot) {
    const key = {
      remoteJid: dest,
      fromMe: true,
      id: ms.message.extendedTextMessage.contextInfo.stanzaId,
    };
    await client.sendMessage(dest, { delete: key });
    return;
  }

  // Case: Group message deletion by admin
  if (verifGroupe) {
    if (verifAdmin || superUser) {
      try {
        const key = {
          remoteJid: dest,
          id: ms.message.extendedTextMessage.contextInfo.stanzaId,
          fromMe: false,
          participant: ms.message.extendedTextMessage.contextInfo.participant
        };

        // Optional: Send a confirmation before deleting
        await client.sendMessage(dest, {
          text:
`╭──❰ *MESSAGE DELETION* ❱──╮
│
│ 🗑️ The message will now be deleted.
│ 🔒 Only admins or bot owners can use this command.
│
╰────────────────────────╯`,
          mentions: [auteurMsgRepondu]
        });

        await client.sendMessage(dest, { delete: key });
      } catch (e) {
        repondre("❌ *Error:* I need *admin rights* to delete this message.");
      }
    } else {
      repondre("⛔ *You must be an administrator to delete messages.*");
    }
  }
});

bmbtz({ nomCom: "info", categorie: 'Group' }, async (dest, client, commandeOptions) => {
  const { ms, repondre, verifGroupe } = commandeOptions;
  if (!verifGroupe) {
    repondre("⚠️ This command is for groups only!");
    return;
  }

  let ppgroup;
  try {
    ppgroup = await client.profilePictureUrl(dest, 'image');
  } catch {
    ppgroup = conf.IMAGE_MENU;
  }

  const info = await client.groupMetadata(dest);

  let mess = {
    image: { url: ppgroup },
    caption:
`╭━━━❰ *GROUP INFO PANEL* ❱━━━✦
┃
┃ 🏷️ *Group Name:* ${info.subject}
┃ 🆔 *Group ID:* ${dest}
┃ 📝 *Description:*
┃ ${info.desc?.replace(/\n/g, '\n┃ ') || 'No description available'}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━✦`
  };

  client.sendMessage(dest, mess, { quoted: ms });
});


 //------------------------------------antilien-------------------------------

 bmbtz({ nomCom: "antilink", categorie: 'Group', reaction: "🔗" }, async (dest, client, commandeOptions) => {
  var { repondre, arg, verifGroupe, superUser, verifAdmin } = commandeOptions;

  if (!verifGroupe) return repondre("🚫 *This command works in groups only.*");

  if (superUser || verifAdmin) {
    const enetatoui = await verifierEtatJid(dest);
    try {
      if (!arg || !arg[0] || arg === ' ') {
        return repondre(
`╭───❰ *ANTILINK HELP MENU* ❱───╮
│
│ ⚙️ *antilink on* → Activate anti-link
│ ⚙️ *antilink off* → Deactivate anti-link
│ ⚙️ *antilink action/remove* → Remove link silently
│ ⚙️ *antilink action/warn* → Warn user
│ ⚙️ *antilink action/delete* → Delete link only
│
│ 📝 Default action is: *delete*
╰────────────────────────────╯`
        );
      }

      const input = arg.join('').toLowerCase();

      if (arg[0] === 'on') {
        if (enetatoui) {
          repondre(
`╭───❰ *ANTILINK STATUS* ❱───╮
│ 🔗 Antilink is *already activated* 
╰──────────────────────────╯`
          );
        } else {
          await ajouterOuMettreAJourJid(dest, "oui");
          repondre(
`╭───❰ *ANTILINK STATUS* ❱───╮
│ ✅ Antilink has been *activated*
╰──────────────────────────╯`
          );
        }
      } else if (arg[0] === 'off') {
        if (enetatoui) {
          await ajouterOuMettreAJourJid(dest, "non");
          repondre(
`╭───❰ *ANTILINK STATUS* ❱───╮
│ ❌ Antilink has been *deactivated*
╰──────────────────────────╯`
          );
        } else {
          repondre(
`╭───❰ *ANTILINK STATUS* ❱───╮
│ ℹ️ Antilink was *not active* 
╰──────────────────────────╯`
          );
        }
      } else if (input.startsWith('action/')) {
        let action = input.split("/")[1];
        if (['remove', 'warn', 'delete'].includes(action)) {
          await mettreAJourAction(dest, action);
          repondre(
`╭───❰ *ANTILINK ACTION UPDATED* ❱───╮
│ 🔧 Action settings to: *${action.toUpperCase()}*
╰────────────────────────────────╯`
          );
        } else {
          repondre(
`❌ Invalid action.
✅ Allowed: *remove*, *warn*, *delete*`
          );
        }
      } else {
        repondre(
`❗ Wrong usage.

Try: *antilink on*, *antilink off*, *antilink action/remove* etc.`
        );
      }

    } catch (error) {
      repondre("❌ *Error:* " + error.message || error);
    }

  } else {
    repondre("🚫 *Only group admins or super users can use this command.*");
  }
});

//----------------------------------------------------------------------------

bmbtz({ nomCom: "group", categorie: 'Group' }, async (dest, client, commandeOptions) => {

  const { repondre, verifGroupe, verifAdmin, superUser, arg } = commandeOptions;

  if (!verifGroupe) {
    return repondre("🚫 *This command is for group use only.*");
  }

  if (!(superUser || verifAdmin)) {
    return repondre("🌚 *Only group admins can use this command.*");
  }

  if (!arg[0]) {
    return repondre(
`📌 *Usage Instructions:*

Type:
- *group open*  → To allow everyone to send messages
- *group close* → To restrict messages to admins only`);
  }

  const option = arg.join(' ').toLowerCase();

  switch (option) {
    case "open":
      await client.groupSettingUpdate(dest, 'not_announcement');
      repondre(
`╭──❰ *GROUP STATUS UPDATE* ❱──╮
│
│ 🔓 The group has been *opened*.
│ ✉️ All members can now send messages.
│
╰────────────────────────────╯`);
      break;

    case "close":
      await client.groupSettingUpdate(dest, 'announcement');
      repondre(
`╭──❰ *GROUP STATUS UPDATE* ❱──╮
│
│ 🔐 The group has been *closed*.
│ 👑 Only *admins* can send messages now.
│
╰────────────────────────────╯`);
      break;

    default:
      repondre("❌ *Invalid option.* Use: group open | group close");
  }
});

bmbtz({ nomCom: "left", categorie: "Mods" }, async (dest, client, commandeOptions) => {

  const { repondre, verifGroupe, superUser } = commandeOptions;
  if (!verifGroupe) { repondre("order reserved for group only"); return };
  if (!superUser) {
    repondre("command reserved for the bot owner");
    return;
  }
  await repondre('sayonnara') ;
   
  client.groupLeave(dest)
});

bmbtz({ nomCom: "gname", categorie: 'Group' }, async (dest, client, commandeOptions) => {
  const { arg, repondre, verifAdmin } = commandeOptions;

  if (!verifAdmin) {
    repondre("⚠️ This command is for *group admins only*.");
    return;
  }

  if (!arg[0]) {
    repondre("✏️ Please enter the new *group name*.");
    return;
  }

  const nom = arg.join(' ');
  await client.groupUpdateSubject(dest, nom);

  const msg =
`╭─❰ *GROUP NAME UPDATED* ❱─╮
│
│ 🆕 New Group Name:
│ ${nom.replace(/\n/g, '\n│ ')}
│
╰────────────────────╯`;

  repondre(msg);
});

bmbtz({ nomCom: "gdesc", categorie: 'Group' }, async (dest, client, commandeOptions) => {
  const { arg, repondre, verifAdmin } = commandeOptions;

  if (!verifAdmin) {
    repondre("⚠️ This command is for *group admins only*.");
    return;
  }

  if (!arg[0]) {
    repondre("✏️ Please enter the new *group description*.");
    return;
  }

  const nom = arg.join(' ');
  await client.groupUpdateDescription(dest, nom);

  const msg =
`╭───❰ *GROUP DESCRIPTION UPDATED* ❱───✦
┃
┃ ✅ Description has been changed to:
┃ ${nom.replace(/\n/g, '\n┃ ')}
┃
╰─────────────────────────────✦`;

  repondre(msg);
});

bmbtz({ nomCom: "gpp", categorie: 'Group' }, async (dest, client, commandeOptions) => {

  const { repondre, msgRepondu, verifAdmin } = commandeOptions;

  if (!verifAdmin) {
    repondre("order reserved for administrators of the group");
    return;
  }; 
  if (msgRepondu.imageMessage) {
    const pp = await  client.downloadAndSaveMediaMessage(msgRepondu.imageMessage) ;

    await client.updateProfilePicture(dest, { url: pp })
                .then( () => {
                    client.sendMessage(dest,{text:"Group pfp changed"})
                    fs.unlinkSync(pp)
                }).catch(() =>   client.sendMessage(dest,{text:err})
)
        
  } else {
    repondre('Please mention an image')
  }

});

/////////////
bmbtz({ nomCom: "hidetag", categorie: 'Group', reaction: "🎤" }, async (dest, client, commandeOptions) => {
  const { repondre, msgRepondu, verifGroupe, arg, verifAdmin, superUser } = commandeOptions;

  if (!verifGroupe) return repondre("🚫 *This command is allowed only in groups.*");
  if (!(verifAdmin || superUser)) return repondre("🚀 *This command is for group admins only.*");

  const metadata = await client.groupMetadata(dest);
  const tag = metadata.participants.map(p => p.id);

  let msg;

  if (msgRepondu) {
    if (msgRepondu.imageMessage) {
      let media = await client.downloadAndSaveMediaMessage(msgRepondu.imageMessage);
      msg = {
        image: { url: media },
        caption: `📢 *Broadcast Message:*\n\n${msgRepondu.imageMessage.caption || ''}`,
        mentions: tag
      };
    } else if (msgRepondu.videoMessage) {
      let media = await client.downloadAndSaveMediaMessage(msgRepondu.videoMessage);
      msg = {
        video: { url: media },
        caption: `🎥 *Video Broadcast:*\n\n${msgRepondu.videoMessage.caption || ''}`,
        mentions: tag
      };
    } else if (msgRepondu.audioMessage) {
      let media = await client.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
      msg = {
        audio: { url: media },
        mimetype: 'audio/mp4',
        mentions: tag
      };
    } else if (msgRepondu.stickerMessage) {
      let media = await client.downloadAndSaveMediaMessage(msgRepondu.stickerMessage);
      let stickerMess = new Sticker(media, {
        pack: 'bmb-tech',
        type: StickerTypes.CROPPED,
        categories: ["🤩", "🎉"],
        id: "12345",
        quality: 70,
        background: "transparent",
      });
      const stickerBuffer = await stickerMess.toBuffer();
      msg = {
        sticker: stickerBuffer,
        mentions: tag
      };
    } else {
      msg = {
        text: `📢 *Message:*\n\n${msgRepondu.conversation}`,
        mentions: tag
      };
    }

    client.sendMessage(dest, msg);

  } else {
    if (!arg || !arg[0]) return repondre("ℹ️ *Enter the text to announce* or reply to a media message.");

    let text =
`╭──❰ *HIDE TAG ANNOUNCEMENT* ❱──╮
│
│ 💬 ${arg.join(' ')}
│
╰────────────────────────────╯`;

    client.sendMessage(dest, {
      text: text,
      mentions: tag
    });
  }
});
