"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc); 
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const logger_1 = __importDefault(require("@whiskeysockets/baileys/lib/Utils/logger"));
const logger = logger_1.default.child({});
logger.level = 'silent';
const pino = require("pino");
const boom_1 = require("@hapi/boom");
const conf = require("./settings");
const axios = require("axios");
let fs = require("fs-extra");
let path = require("path");
const FileType = require('file-type');
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
//import chalk from 'chalk'
const { verifierEtatJid , recupererActionJid } = require("./lib/antilien");
const { atbverifierEtatJid , atbrecupererActionJid } = require("./lib/antibot");
let evt = require(__dirname + "/devbmb/bmbtz");
const {isUserBanned , addUserToBanList , removeUserFromBanList} = require("./lib/banUser");
const  {addGroupToBanList,isGroupBanned,removeGroupFromBanList} = require("./lib/banGroup");
const {isGroupOnlyAdmin,addGroupToOnlyAdminList,removeGroupFromOnlyAdminList} = require("./lib/onlyAdmin");
//const //{loadCmd}=require("/devbmb/mesfonctions")
let { reagir } = require(__dirname + "/devbmb/app");
const { getAllSudoNumbers } = require("./lib/sudo");
let cachedSudoNumbers = [];
async function refreshSudoCache() {
    try { cachedSudoNumbers = await getAllSudoNumbers(); } catch (e) {}
}
refreshSudoCache();
setInterval(refreshSudoCache, 30000); // refresh every 30s instead of reading the file every message
var session = conf.session.replace(/B.M.B-TECH;;;;/g,"");
const prefixe = conf.PREFIXE;
const more = String.fromCharCode(8206)
const readmore = more.repeat(4001)
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
async function authentification() {
    try {
        //console.log("le data "+data)
        if (!fs.existsSync(__dirname + "/public/creds.json")) {
            console.log("connexion en cour ...");
            await fs.writeFileSync(__dirname + "/public/creds.json", atob(session), "utf8");
            //console.log(session)
        }
        else if (fs.existsSync(__dirname + "/public/creds.json") && session != "zokk") {
            await fs.writeFileSync(__dirname + "/public/creds.json", atob(session), "utf8");
        }
    }
    catch (e) {
        console.log("Session Invalid " + e);
        return;
    }
}
authentification();
const { makeStore } = require(__dirname + "/lib/MakeStore");
const store = makeStore();

// ================== RECONNECT GUARD ==================
// Prevents overlapping main() calls / double reconnections which
// were causing the bot to restart repeatedly.
let isReconnecting = false;
function safeReconnect(reason) {
    if (isReconnecting) {
        console.log(`Reconnect already in progress, skipping duplicate trigger (${reason})`);
        return;
    }
    isReconnecting = true;
    console.log(`Reconnecting... (${reason})`);
    setTimeout(() => {
        main();
    }, 2000); // small delay avoids hammering WhatsApp with instant reconnects
}

// ================== AUTO FOLLOW / AUTO LIKE (style: NOVA-XMD) ==================
const CHANNEL_JID = '120363382023564830@newsletter';
const CHANNEL_EMOJIS = ['❤️', '🫪', '👍🏻', '🤩', '⚡', '🗿', '😮'];
const STATUS_EMOJIS = ['❤️', '🩶', '🔥', '🤍', '♦️', '🎉', '💚', '💯', '✨', '☢️', '😍', '🎊'];
let hasFollowedChannel = false; // guard so we only call newsletterFollow once per process

// boundedReconnect: kwa ajili ya kesi hatarishi (badSession, connectionReplaced)
// ambazo zinaweza kuashiria tatizo la kudumu la session. Tunajaribu mara chache
// tu (na muda unaozidi kuongezeka - backoff) badala ya kuacha kabisa AU kujaribu
// milele bila mwisho.
let boundedAttempts = 0;
const MAX_BOUNDED_ATTEMPTS = 5;
function boundedReconnect(reason) {
    if (isReconnecting) {
        console.log(`Reconnect already in progress, skipping duplicate trigger (${reason})`);
        return;
    }
    boundedAttempts++;
    if (boundedAttempts > MAX_BOUNDED_ATTEMPTS) {
        console.log(`❌ Imeshindikana ku-reconnect baada ya majaribio ${MAX_BOUNDED_ATTEMPTS} (${reason}). Tafadhali tengeneza SESSION_ID mpya na uweke upya (redeploy).`);
        return;
    }
    isReconnecting = true;
    const backoffMs = Math.min(5000 * boundedAttempts, 30000); // 5s,10s,15s...30s max
    console.log(`Reconnecting (bounded, attempt ${boundedAttempts}/${MAX_BOUNDED_ATTEMPTS})... (${reason}) in ${backoffMs}ms`);
    setTimeout(() => {
        main();
    }, backoffMs);
}
// =======================================================

setTimeout(() => {
    async function main() {
        const { version, isLatest } = await (0, baileys_1.fetchLatestBaileysVersion)();
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(__dirname + "/public");
        const sockOptions = {
            version,
            logger: pino({ level: "silent" }),
            browser: ['Bmb-Tech', "safari", "1.0.0"],
            printQRInTerminal: true,
            fireInitQueries: false,
            shouldSyncHistoryMessage: (msg) => {
                // Skip full history sync (matches Baileys' own default
                // behavior) while still allowing lighter sync types
                // needed for LID mapping / group participation.
                return msg?.syncType !== 2; // 2 = proto.HistorySync.HistorySyncType.FULL
            },
            downloadHistory: false,
            syncFullHistory: false,
            generateHighQualityLinkPreview: true,
            markOnlineOnConnect: false,
            keepAliveIntervalMs: 30_000,
            /* auth: state*/ auth: {
                creds: state.creds,
                /** caching makes the store faster to send/recv messages */
                keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, logger),
            },
            //////////
            getMessage: async (key) => {
                if (store) {
                    const msg = store.loadMessage(key.remoteJid, key.id);
                    return msg?.message || undefined;
                }
                return {
                    conversation: 'An Error Occurred, Repeat Command!'
                };
            }
            ///////
        };
        const zk = (0, baileys_1.default)(sockOptions);
store.bind(zk.ev);
   const rateLimit = new Map();

// Silent Rate Limiting (No Logs)
function isRateLimited(jid) {
    const now = Date.now();
    if (!rateLimit.has(jid)) {
        rateLimit.set(jid, now);
        return false;
    }
    const lastRequestTime = rateLimit.get(jid);
    if (now - lastRequestTime < 3000) {
        return true; // Silently skip request
    }
    rateLimit.set(jid, now);
    return false;
}

// Silent Group Metadata Fetch (Handles Errors Without Logging)
const groupMetadataCache = new Map();
async function getGroupMetadata(zk, groupId) {
    if (groupMetadataCache.has(groupId)) {
        return groupMetadataCache.get(groupId);
    }

    try {
        const metadata = await zk.groupMetadata(groupId);
        groupMetadataCache.set(groupId, metadata);
        setTimeout(() => groupMetadataCache.delete(groupId), 60000);
        return metadata;
    } catch (error) {
        if (error.message.includes("rate-overlimit")) {
            await new Promise(res => setTimeout(res, 5000)); // Wait before retrying
        }
        return null;
    }
}

// Silent Error Handling (Prevents Crashes)
process.on("uncaughtException", (err) => { console.log("UNCAUGHT EXCEPTION:", err); });
process.on("unhandledRejection", (err) => { console.log("UNHANDLED REJECTION:", err); });

// Silent Message Handling
zk.ev.on("messages.upsert", async (m) => {
    const { messages } = m;
    if (!messages || messages.length === 0) return;

    for (const ms of messages) {
        if (!ms.message) continue;
        const from = ms.key.remoteJid;
        if (isRateLimited(from)) continue;
    }
});

// ================== AUTO LIKE STATUS + AUTO LIKE CHANNEL POST (style: NOVA-XMD) ==================
zk.ev.on("messages.upsert", async (m) => {
    try {
        const { messages } = m;
        if (!messages || messages.length === 0) return;

        for (const mek of messages) {
            const remoteJid = mek.key?.remoteJid;
            if (!remoteJid || mek.message?.protocolMessage) continue;

            // Auto-like status updates
            if (remoteJid === "status@broadcast") {
                if ((conf.AUTO_REACT_STATUS || "").toLowerCase() === "on") {
                    try {
                        const posterJid = mek.key?.participant || mek.participant;
                        if (!posterJid) continue;
                        const botJid = zk.decodeJid ? zk.decodeJid(zk.user.id) : zk.user.id;
                        const emoji = STATUS_EMOJIS[Math.floor(Math.random() * STATUS_EMOJIS.length)];
                        await zk.sendMessage(
                            "status@broadcast",
                            { react: { text: emoji, key: { ...mek.key, participant: posterJid } } },
                            { statusJidList: [posterJid, botJid].filter(Boolean) }
                        ).catch(() => {});
                    } catch (e) {}
                }
                continue;
            }

            // Auto-like BMB Tech channel posts (always on, matches NOVA-XMD)
            if (remoteJid === CHANNEL_JID) {
                try {
                    const messageId = mek.key?.server_id || mek.newsletterServerId || mek.key.id;
                    if (!messageId || !zk?.user?.id) continue;
                    const emoji = CHANNEL_EMOJIS[Math.floor(Math.random() * CHANNEL_EMOJIS.length)];
                    const delay = 3000 + Math.floor(Math.random() * 7000);
                    await new Promise((r) => setTimeout(r, delay));
                    if (typeof zk.newsletterReactMessage === "function") {
                        await zk.newsletterReactMessage(remoteJid, messageId.toString(), emoji);
                    }
                } catch (e) {}
            }
        }
    } catch (e) {}
});

// Silent Group Updates
zk.ev.on("groups.update", async (updates) => {
    for (const update of updates) {
        const { id } = update;
        if (!id.endsWith("@g.us")) continue;
        await getGroupMetadata(zk, id);
    }
});     

const moment = require("moment-timezone");

zk.ev.on("messages.upsert", async (m) => {
    if (conf.ANTIDELETE === "on") {
        const { messages } = m;
        const ms = messages[0];
        if (!ms.message) return;

        const messageKey = ms.key;
        const remoteJid = messageKey.remoteJid;

        // Initialize storage
        if (!store.chats[remoteJid]) {
            store.chats[remoteJid] = [];
        }

        // Save message
        store.chats[remoteJid].push(ms);

        // If deleted
        if (ms.message.protocolMessage && ms.message.protocolMessage.type === 0) {
            const deletedKey = ms.message.protocolMessage.key;
            const chatMessages = store.chats[remoteJid];
            const deletedMessage = chatMessages.find(
                (msg) => msg.key.id === deletedKey.id
            );

            if (deletedMessage) {
                try {
                    const participant = deletedMessage.key.participant || deletedMessage.key.remoteJid;
                    const name = `@${participant.split("@")[0]}`;
                    const botOwnerJid = `${conf.NUMERO_OWNER}@s.whatsapp.net`;

                    const date = moment().tz("Africa/Nairobi").format("DD/MM/YYYY");
                    const time = moment().tz("Africa/Nairobi").format("HH:mm:ss");

                    const boxHeader = `╭───────────────━⊷\n`;
                    const boxFooter = `╰───────────────━⊷`;
                    const boxBody = `
║ *🗑️ 𝗗𝗘𝗟𝗘𝗧𝗘𝗗 𝗠𝗘𝗦𝗦𝗔𝗚𝗘*
║══════════════════════
║ 👤 From: ${name}
║══════════════════════
║ 📅 Date: ${date}
║══════════════════════
║ 🕒 Time: ${time}
║══════════════════════`;

                    const fullText = `${boxHeader}${boxBody}\n${boxFooter}`;

                    if (deletedMessage.message.conversation) {
                        await zk.sendMessage(botOwnerJid, {
                            text: `${fullText}\n\n📝 *Message:* ${deletedMessage.message.conversation}`,
                            mentions: [participant],
                        });
                    } else if (deletedMessage.message.imageMessage) {
                        const caption = deletedMessage.message.imageMessage.caption || '';
                        const imagePath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.imageMessage);
                        await zk.sendMessage(botOwnerJid, {
                            image: { url: imagePath },
                            caption: `${fullText}\n\n🖼️ ${caption}`,
                            mentions: [participant],
                        });
                    } else if (deletedMessage.message.videoMessage) {
                        const caption = deletedMessage.message.videoMessage.caption || '';
                        const videoPath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.videoMessage);
                        await zk.sendMessage(botOwnerJid, {
                            video: { url: videoPath },
                            caption: `${fullText}\n\n🎬 ${caption}`,
                            mentions: [participant],
                        });
                    } else if (deletedMessage.message.audioMessage) {
                        const audioPath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.audioMessage);
                        await zk.sendMessage(botOwnerJid, {
                            audio: { url: audioPath },
                            ptt: true,
                            caption: `${fullText}\n🔊 Deleted Voice`,
                            mentions: [participant],
                        });
                    } else if (deletedMessage.message.stickerMessage) {
                        const stickerPath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.stickerMessage);
                        await zk.sendMessage(botOwnerJid, {
                            sticker: { url: stickerPath },
                            caption: `${fullText}\n🗑️ Deleted Sticker`,
                            mentions: [participant],
                        });
                    }
                } catch (error) {
                    console.error('❌ Error handling deleted message:', error);
                }
            }
        }
    }
});
// Utility function for delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Track the last reaction time to prevent overflow
let lastReactionTime = 0;

// (Old single-emoji "💯" status auto-reactor removed — replaced by the
// varied-emoji STATUS_EMOJIS auto-like listener added above, styled
// after NOVA-XMD.)

zk.ev.on("messages.upsert", async (m) => {
    const { messages } = m;
    const ms = messages[0];

    if (!ms.message) return;

    const messageContent = ms.message.conversation || ms.message.extendedTextMessage?.text || '';
    const sender = ms.key.remoteJid;

    // Find the prefix dynamically (any character at the start of the message)
    const prefixUsed = messageContent.charAt(0);

    // Check if the command is "vcard"
    if (messageContent.slice(1).toLowerCase() === "vcf") {
        // Check if the command is issued in a group
        if (!sender.endsWith("@g.us")) {
            await zk.sendMessage(sender, {
                text: `❌ This command only works in groups.\n\n🚀 Bmb Tech`,
            });
            return;
        }

        const baseName = "Charles family";

        // Call the function to create and send vCards for group members
        await createAndSendGroupVCard(sender, baseName, zk);
    }
});

        zk.ev.on("call", async (callData) => {
  if (conf.ANTICALL === 'on') {
    const callId = callData[0].id;
    await zk.rejectCall(callId, callData[0].from);
    // No messages are sent here at all.
  }
});
        
        zk.ev.on("messages.upsert", async (m) => {
            const { messages } = m;
            const ms = messages[0];
            if (!ms.message)
                return;
            const decodeJid = (jid) => {
                if (!jid)
                    return jid;
                if (/:\d+@/gi.test(jid)) {
                    let decode = (0, baileys_1.jidDecode)(jid) || {};
                    return decode.user && decode.server && decode.user + '@' + decode.server || jid;
                }
                else
                    return jid;
            };
            var mtype = (0, baileys_1.getContentType)(ms.message);
            var texte = mtype == "conversation" ? ms.message.conversation : mtype == "imageMessage" ? ms.message.imageMessage?.caption : mtype == "videoMessage" ? ms.message.videoMessage?.caption : mtype == "extendedTextMessage" ? ms.message?.extendedTextMessage?.text : mtype == "buttonsResponseMessage" ?
                ms?.message?.buttonsResponseMessage?.selectedButtonId : mtype == "listResponseMessage" ?
                ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId : mtype == "messageContextInfo" ?
                (ms?.message?.buttonsResponseMessage?.selectedButtonId || ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId || ms.text) : "";
            var origineMessage = ms.key.remoteJid;
            var idBot = decodeJid(zk.user.id);
            var servBot = idBot.split('@')[0];
            /* const dj='22559763447';
             const dj2='254751284190';
             const luffy='254762016957'*/
            /*  var superUser=[servBot,dj,dj2,luffy].map((s)=>s.replace(/[^0-9]/g)+"@s.whatsapp.net").includes(auteurMessage);
              var dev =[dj,dj2,luffy].map((t)=>t.replace(/[^0-9]/g)+"@s.whatsapp.net").includes(auteurMessage);*/
            const verifGroupe = origineMessage?.endsWith("@g.us");
            var infosGroupe = verifGroupe ? await getGroupMetadata(zk, origineMessage) : "";
            var nomGroupe = verifGroupe ? (infosGroupe?.subject || "") : "";
            var msgRepondu = ms.message.extendedTextMessage?.contextInfo?.quotedMessage;
            var auteurMsgRepondu = decodeJid(ms.message?.extendedTextMessage?.contextInfo?.participant);
            //ms.message.extendedTextMessage?.contextInfo?.mentionedJid
            // ms.message.extendedTextMessage?.contextInfo?.quotedMessage.
            var mr = ms.Message?.extendedTextMessage?.contextInfo?.mentionedJid;
            var utilisateur = mr ? mr : msgRepondu ? auteurMsgRepondu : "";
            var auteurMessage = verifGroupe ? (ms.key.participant ? ms.key.participant : ms.participant) : origineMessage;
            if (ms.key.fromMe) {
                auteurMessage = idBot;
            }
            
            var membreGroupe = verifGroupe ? ms.key.participant : '';
            const nomAuteurMessage = ms.pushName;
            const dj = '254710772666';
            const dj2 = '254710772666';
            const dj3 = "254710772666";
            const luffy = '254710772666';
            const sudo = cachedSudoNumbers;
            const superUserNumbers = [servBot, dj, dj2, dj3, luffy, conf.NUMERO_OWNER].map((s) => s.replace(/[^0-9]/g) + "@s.whatsapp.net");
            const allAllowedNumbers = superUserNumbers.concat(sudo);
            const superUser = allAllowedNumbers.includes(auteurMessage);
            
            var dev = [dj, dj2,dj3,luffy].map((t) => t.replace(/[^0-9]/g) + "@s.whatsapp.net").includes(auteurMessage);
            function repondre(mes) { zk.sendMessage(origineMessage, { text: mes }, { quoted: ms }); }
            console.log("\t🌍B.M.B-TECH ONLINE🌍");
            console.log("=========== written message===========");
            if (verifGroupe) {
                console.log("message provenant du groupe : " + nomGroupe);
            }
            console.log("message envoyé par : " + "[" + nomAuteurMessage + " : " + auteurMessage.split("@s.whatsapp.net")[0] + " ]");
            console.log("type de message : " + mtype);
            console.log("------ contenu du message ------");
            console.log(texte);
            /**  */
            function groupeAdmin(membreGroupe) {
                let admin = [];
                for (m of membreGroupe) {
                    if (m.admin == null)
                        continue;
                    admin.push(m.id);
                }
                // else{admin= false;}
                return admin;
            }

            var etat =conf.ETAT;
            const presenceType = etat==1 ? "available" : etat==2 ? "composing" : etat==3 ? "recording" : "unavailable";
            zk.sendPresenceUpdate(presenceType, origineMessage).catch(()=>{});

            const mbre = verifGroupe ? (infosGroupe?.participants || []) : '';
            //  const verifAdmin = verifGroupe ? await mbre.filter(v => v.admin !== null).map(v => v.id) : ''
            let admins = verifGroupe ? groupeAdmin(mbre) : '';
            const verifAdmin = verifGroupe ? admins.includes(auteurMessage) : false;
            var verifBmbtzAdmin = verifGroupe ? admins.includes(idBot) : false;
            /** ** */
            /** ***** */
            const arg = texte ? texte.trim().split(/ +/).slice(1) : null;
            const verifCom = texte ? texte.startsWith(prefixe) : false;
            const com = verifCom ? texte.slice(1).trim().split(/ +/).shift().toLowerCase() : false;
           
         
            const lien = conf.URL.split(',')  

            
            // Utiliser une boucle for...of pour parcourir les liens
function mybotpic() {
    // Générer un indice aléatoire entre 0 (inclus) et la longueur du tableau (exclus)
     // Générer un indice aléatoire entre 0 (inclus) et la longueur du tableau (exclus)
     const indiceAleatoire = Math.floor(Math.random() * lien.length);
     // Récupérer le lien correspondant à l'indice aléatoire
     const lienAleatoire = lien[indiceAleatoire];
     return lienAleatoire;
  }
            var commandeOptions = {
    superUser, dev,
    verifGroupe,
    mbre,
    membreGroupe,
    verifAdmin,
    infosGroupe,
    nomGroupe,
    auteurMessage,
    nomAuteurMessage,
    idBot,
    verifBmbtzAdmin,
    prefixe,
    arg,
    repondre,
    mtype,
    groupeAdmin,
    msgRepondu,
    auteurMsgRepondu,
    ms,
    mybotpic
};


// Auto read messages
if (conf.AUTO_READ === 'on' && !ms.key.fromMe) {
    zk.readMessages([ms.key]).catch(()=>{});
}
            /** ****** gestion auto-status  */
            if (ms.key && ms.key.remoteJid === "status@broadcast" && conf.AUTO_READ_STATUS === "on") {
                await zk.readMessages([ms.key]);
            }
            if (ms.key && ms.key.remoteJid === 'status@broadcast' && conf.AUTO_DOWNLOAD_STATUS === "on") {
                /* await zk.readMessages([ms.key]);*/
                if (ms.message.extendedTextMessage) {
                    var stTxt = ms.message.extendedTextMessage.text;
                    await zk.sendMessage(idBot, { text: stTxt }, { quoted: ms });
                }
                else if (ms.message.imageMessage) {
                    var stMsg = ms.message.imageMessage.caption;
                    var stImg = await zk.downloadAndSaveMediaMessage(ms.message.imageMessage);
                    await zk.sendMessage(idBot, { image: { url: stImg }, caption: stMsg }, { quoted: ms });
                }
                else if (ms.message.videoMessage) {
                    var stMsg = ms.message.videoMessage.caption;
                    var stVideo = await zk.downloadAndSaveMediaMessage(ms.message.videoMessage);
                    await zk.sendMessage(idBot, {
                        video: { url: stVideo }, caption: stMsg
                    }, { quoted: ms });
                }
                /** *************** */
                // console.log("*nouveau status* ");
            }
            /** ******fin auto-status */
            if (!dev && origineMessage == "120363158701337904@g.us") {
                return;
            }
            
 //---------------------------------------rang-count--------------------------------
             if (texte && auteurMessage.endsWith("s.whatsapp.net")) {
  const { ajouterOuMettreAJourUserData } = require("./lib/level"); 
  try {
    await ajouterOuMettreAJourUserData(auteurMessage);
  } catch (e) {
    console.error(e);
  }
              }
            
                /////////////////////////////   Mentions /////////////////////////////////////////
         
              try {
        
                if (ms.message[mtype].contextInfo.mentionedJid && (ms.message[mtype].contextInfo.mentionedJid.includes(idBot) ||  ms.message[mtype].contextInfo.mentionedJid.includes(conf.NUMERO_OWNER + '@s.whatsapp.net'))    /*texte.includes(idBot.split('@')[0]) || texte.includes(conf.NUMERO_OWNER)*/) {
            
                    if (origineMessage == "120363382023564830@newsletter") {
                        return;
                    } ;
            
                    if(superUser) {console.log('hummm') ; return ;} 
                    
                    let mbd = require('./lib/mention') ;
            
                    let alldata = await mbd.recupererToutesLesValeurs() ;
            
                        let data = alldata[0] ;
            
                    if ( data.status === 'non') { console.log('mention pas actifs') ; return ;}
            
                    let msg ;
            
                    if (data.type.toLocaleLowerCase() === 'image') {
            
                        msg = {
                                image : { url : data.url},
                                caption : data.message
                        }
                    } else if (data.type.toLocaleLowerCase() === 'video' ) {
            
                            msg = {
                                    video : {   url : data.url},
                                    caption : data.message
                            }
            
                    } else if (data.type.toLocaleLowerCase() === 'sticker') {
            
                        let stickerMess = new Sticker(data.url, {
                            pack: conf.NOM_OWNER,
                            type: StickerTypes.FULL,
                            categories: ["🤩", "🎉"],
                            id: "12345",
                            quality: 70,
                            background: "transparent",
                          });
            
                          const stickerBuffer2 = await stickerMess.toBuffer();
            
                          msg = {
                                sticker : stickerBuffer2 
                          }
            
                    }  else if (data.type.toLocaleLowerCase() === 'audio' ) {
            
                            msg = {
            
                                audio : { url : data.url } ,
                                mimetype:'audio/mp4',
                                 }
                        
                    }
            
                    zk.sendMessage(origineMessage,msg,{quoted : ms})
            
                }
            } catch (error) {
                
            } 


     //anti-lien
     try {
        const yes = await verifierEtatJid(origineMessage)
        if (texte.includes('https://') && verifGroupe &&  yes  ) {

         console.log("lien detecté")
            var verifZokAdmin = verifGroupe ? admins.includes(idBot) : false;
            
             if(superUser || verifAdmin || !verifZokAdmin  ) { console.log('je fais rien'); return};
                        
                                    const key = {
                                        remoteJid: origineMessage,
                                        fromMe: false,
                                        id: ms.key.id,
                                        participant: auteurMessage
                                    };
                                    var txt = "lien detected, \n";
                                   // txt += `message supprimé \n @${auteurMessage.split("@")[0]} rétiré du groupe.`;
                                    const gifLink = "https://github.com/novaxmd/BMB-XMD-DATA/raw/refs/heads/main/remover.gif";
                                    var sticker = new Sticker(gifLink, {
                                        pack: 'Bmb-Tech',
                                        author: conf.OWNER_NAME,
                                        type: StickerTypes.FULL,
                                        categories: ['🤩', '🎉'],
                                        id: '12345',
                                        quality: 50,
                                        background: '#000000'
                                    });
                                    await sticker.toFile("st1.webp");
                                    // var txt = `@${auteurMsgRepondu.split("@")[0]} a été rétiré du groupe..\n`
                                    var action = await recupererActionJid(origineMessage);

                                      if (action === 'remove') {

                                        txt += `message deleted \n @${auteurMessage.split("@")[0]} removed from group.`;

                                    await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") });
                                    (0, baileys_1.delay)(800);
                                    await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
                                    try {
                                        await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                                    }
                                    catch (e) {
                                        console.log("antiien ") + e;
                                    }
                                    await zk.sendMessage(origineMessage, { delete: key });
                                    await fs.unlink("st1.webp"); } 
                                        
                                       else if (action === 'delete') {
                                        txt += `message deleted \n @${auteurMessage.split("@")[0]} avoid sending link.`;
                                        // await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") }, { quoted: ms });
                                       await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
                                       await zk.sendMessage(origineMessage, { delete: key });
                                       await fs.unlink("st1.webp");

                                    } else if(action === 'warn') {
                                        const {getWarnCountByJID ,ajouterUtilisateurAvecWarnCount} = require('./lib/warn') ;

                            let warn = await getWarnCountByJID(auteurMessage) ; 
                            let warnlimit = conf.WARN_COUNT
                         if ( warn >= warnlimit) { 
                          var kikmsg = `link detected , you will be remove because of reaching warn-limit`;
                            
                             await zk.sendMessage(origineMessage, { text: kikmsg , mentions: [auteurMessage] }, { quoted: ms }) ;


                             await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                             await zk.sendMessage(origineMessage, { delete: key });


                            } else {
                                var rest = warnlimit - warn ;
                              var  msg = `Link detected , your warn_count was upgrade ;\n rest : ${rest} `;

                              await ajouterUtilisateurAvecWarnCount(auteurMessage)

                              await zk.sendMessage(origineMessage, { text: msg , mentions: [auteurMessage] }, { quoted: ms }) ;
                              await zk.sendMessage(origineMessage, { delete: key });

                            }
                                    }
                                }
                                
                            }
                        
                    
                
            
        
    
    catch (e) {
        console.log("lib err " + e);
    }
    


    /** *************************anti-bot******************************************** */
    try {
        const botMsg = ms.key?.id?.startsWith('BAES') && ms.key?.id?.length === 16;
        const baileysMsg = ms.key?.id?.startsWith('BAE5') && ms.key?.id?.length === 16;
        if (botMsg || baileysMsg) {

            if (mtype === 'reactionMessage') { console.log('Je ne reagis pas au reactions') ; return} ;
            const antibotactiver = await atbverifierEtatJid(origineMessage);
            if(!antibotactiver) {return};

            if( verifAdmin || auteurMessage === idBot  ) { console.log('je fais rien'); return};
                        
            const key = {
                remoteJid: origineMessage,
                fromMe: false,
                id: ms.key.id,
                participant: auteurMessage
            };
            var txt = "bot detected, \n";
           // txt += `message supprimé \n @${auteurMessage.split("@")[0]} rétiré du groupe.`;
            const gifLink = "https://github.com/novaxmd/BMB-XMD-DATA/raw/refs/heads/main/remover.gif";
            var sticker = new Sticker(gifLink, {
                pack: 'Bmb-Tech',
                author: conf.OWNER_NAME,
                type: StickerTypes.FULL,
                categories: ['🤩', '🎉'],
                id: '12345',
                quality: 50,
                background: '#000000'
            });
            await sticker.toFile("st1.webp");
            // var txt = `@${auteurMsgRepondu.split("@")[0]} a été rétiré du groupe..\n`
            var action = await atbrecupererActionJid(origineMessage);

              if (action === 'remove') {

                txt += `message deleted \n @${auteurMessage.split("@")[0]} removed from group.`;

            await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") });
            (0, baileys_1.delay)(800);
            await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
            try {
                await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
            }
            catch (e) {
                console.log("antibot ") + e;
            }
            await zk.sendMessage(origineMessage, { delete: key });
            await fs.unlink("st1.webp"); } 
                
               else if (action === 'delete') {
                txt += `message delete \n @${auteurMessage.split("@")[0]} Avoid sending link.`;
                //await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") }, { quoted: ms });
               await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
               await zk.sendMessage(origineMessage, { delete: key });
               await fs.unlink("st1.webp");

            } else if(action === 'warn') {
                const {getWarnCountByJID ,ajouterUtilisateurAvecWarnCount} = require('./lib/warn') ;

    let warn = await getWarnCountByJID(auteurMessage) ; 
    let warnlimit = conf.WARN_COUNT
 if ( warn >= warnlimit) { 
  var kikmsg = `bot detected ;you will be remove because of reaching warn-limit`;
    
     await zk.sendMessage(origineMessage, { text: kikmsg , mentions: [auteurMessage] }, { quoted: ms }) ;


     await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
     await zk.sendMessage(origineMessage, { delete: key });


    } else {
        var rest = warnlimit - warn ;
      var  msg = `bot detected , your warn_count was upgrade ;\n rest : ${rest} `;

      await ajouterUtilisateurAvecWarnCount(auteurMessage)

      await zk.sendMessage(origineMessage, { text: msg , mentions: [auteurMessage] }, { quoted: ms }) ;
      await zk.sendMessage(origineMessage, { delete: key });

    }
                }
        }
    }
    catch (er) {
        console.log('.... ' + er);
    }        
             
         
            //execution des commandes   
            if (verifCom) {
                //await await zk.readMessages(ms.key);
                const cd = evt.cm.find((bmbtz) => bmbtz.nomCom === (com) || (Array.isArray(bmbtz.alias) && bmbtz.alias.includes(com)));
                if (cd) {
                    try {

            if ((conf.MODE).toLocaleLowerCase() != 'on' && !superUser) {
                return;
            }

                         /******************* PM_PERMT***************/

            if (!superUser && origineMessage === auteurMessage&& conf.PM_PERMIT === "on" ) {
                repondre("You don't have acces to commands here") ; return }
            ///////////////////////////////

             
            /*****************************banGroup  */
            if (!superUser && verifGroupe) {

                 let req = await isGroupBanned(origineMessage);
                    
                        if (req) { return }
            }

              /***************************  ONLY-ADMIN  */

            if(!verifAdmin && verifGroupe) {
                 let req = await isGroupOnlyAdmin(origineMessage);
                    
                        if (req) {  return }}

              /**********************banuser */
         
            
                if(!superUser) {
                    let req = await isUserBanned(auteurMessage);
                    
                        if (req) {repondre("You are banned from bot commands"); return}
                    

                } 

                        reagir(origineMessage, zk, ms, cd.reaction);
                        cd.fonction(origineMessage, zk, commandeOptions);
                    }
                    catch (e) {
                        console.log("😡😡 " + e);
                        zk.sendMessage(origineMessage, { text: "😡😡 " + e }, { quoted: ms });
                    }
                }
            }
            //fin exécution commandes
        });
        //fin événement message

// ================== GROUP EVENTS SECTION ==================
/******** evenement groupe update ****************/
const { recupevents } = require('./lib/welcome');

zk.ev.on('group-participants.update', async (group) => {
    console.log('Group participants update triggered:', group);

    try {
        const metadata = await zk.groupMetadata(group.id);
        const membres = group.participants;
        const groupName = metadata.subject || "Group";
        const groupDesc = metadata.desc || "no group information";

        // date and time 
        const now = new Date();
        const date = now.toLocaleDateString('en-GB');
        const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        // 🟢 WELCOME
        if (group.action === 'add' && (await recupevents(group.id, "welcome")) === 'on') {
            let ppuser;
            try {
                ppuser = await zk.profilePictureUrl(membres[0], 'image');
            } catch (error) {
                ppuser = 'https://files.catbox.moe/f9jxiv.jpg';
            }

            let msg = `
╭───────────────────────━⊷
║𝗕.𝗠.𝗕-𝗧𝗘𝗖𝗛 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗚𝗥𝗢𝗨𝗣
║════════════════════════
║ɢʀᴏᴜᴘ ɴᴀᴍᴇ ${groupName}
║════════════════════════
║ᴅᴀᴛᴇ ʜᴇ ᴊᴏɪɴᴇᴅ ${date}
║════════════════════════
║ᴛʜᴇ ᴛɪᴍᴇ ʜᴇ ᴇɴᴛᴇʀᴇᴅ ${time}
║════════════════════════
║ Bmb web bmbtech.zone.id
║════════════════════════
║ ${groupDesc}
╰──────────────────────━⊷`;

            await zk.sendMessage(group.id, {
                image: { url: ppuser },
                caption: msg,
                mentions: membres
            });

            console.log('✅ Welcome message sent.');
        }

        // 🔴 GOODBYE
        else if (group.action === 'remove' && (await recupevents(group.id, "goodbye")) === 'on') {
            let ppuser;
            try {
                ppuser = await zk.profilePictureUrl(membres[0], 'image');
            } catch (error) {
                ppuser = 'https://files.catbox.moe/f9jxiv.jpg';
            }

            let msg = `
╭─────────────────────────━⊷
║ɢᴏᴏᴅʙʏᴇ👋 @${membres[0].split("@")[0]}
║════════════════════════
║ᴛʜᴇ ᴛɪᴍᴇ ʜᴇ ʟᴇғᴛ ${time}
║════════════════════════
║ᴅᴀᴛᴇ ɪs ᴏᴜᴛ ${date}
║════════════════════════
║Bmb web bmbtech.zone.id
╰──────────────────────────━⊷`;

            await zk.sendMessage(group.id, {
                image: { url: ppuser },
                caption: msg,
                mentions: membres
            });

            console.log('✅ Goodbye message sent.');
        }

        // 🛑 ANTI-PROMOTE
        else if (group.action === 'promote' && (await recupevents(group.id, "antipromote")) === 'on') {
            if (
                group.author === metadata.owner ||
                group.author === zk.user.id ||
                group.author === group.participants[0]
            ) {
                console.log('SuperUser detected, no action taken.');
                return;
            }

            await zk.groupParticipantsUpdate(group.id, [group.author, group.participants[0]], "demote");

            await zk.sendMessage(group.id, {
                text: `🚫 @${group.author.split("@")[0]} has violated the anti-promotion rule. Both @${group.author.split("@")[0]} and @${group.participants[0].split("@")[0]} have been removed from administrative rights.`,
                mentions: [group.author, group.participants[0]]
            });

            console.log('❌ Anti-promotion action executed.');
        }

        // 🟡 ANTI-DEMOTE
        else if (group.action === 'demote' && (await recupevents(group.id, "antidemote")) === 'on') {
            if (
                group.author === metadata.owner ||
                group.author === zk.user.id ||
                group.author === group.participants[0]
            ) {
                console.log('SuperUser detected, no action taken.');
                return;
            }

            await zk.groupParticipantsUpdate(group.id, [group.author], "demote");
            await zk.groupParticipantsUpdate(group.id, [group.participants[0]], "promote");

            await zk.sendMessage(group.id, {
                text: `🚫 @${group.author.split("@")[0]} has violated the anti-demotion rule by removing @${group.participants[0].split("@")[0]}. Consequently, he has been stripped of administrative rights.`,
                mentions: [group.author, group.participants[0]]
            });

            console.log('❌ Anti-demotion action executed.');
        }

    } catch (e) {
        console.error('❌ Error handling group participants update:', e);
    }
});
/******** fin d'evenement groupe update *************************/
// ================== END GROUP EVENTS SECTION ==================

    /*****************************Cron setup */

        
    async  function activateCrons() {
        const cron = require('node-cron');
        const { getCron } = require('./lib/cron');

          let crons = await getCron();
          console.log(crons);
          if (crons.length > 0) {
        
            for (let i = 0; i < crons.length; i++) {
        
              if (crons[i].mute_at != null) {
                let set = crons[i].mute_at.split(':');

                console.log(`etablissement d'un automute pour ${crons[i].group_id} a ${set[0]} H ${set[1]}`)

                cron.schedule(`${set[1]} ${set[0]} * * *`, async () => {
                  await zk.groupSettingUpdate(crons[i].group_id, 'announcement');
                  zk.sendMessage(crons[i].group_id, { 
    image: { url: './scs/media/chrono.webp' },
    caption: "Hello, it's time to close the group; sayonara." 
});

                }, {
                    timezone: "Africa/Nairobi"
                  });
              }
        
              if (crons[i].unmute_at != null) {
                let set = crons[i].unmute_at.split(':');

                console.log(`etablissement d'un autounmute pour ${set[0]} H ${set[1]} `)
        
                cron.schedule(`${set[1]} ${set[0]} * * *`, async () => {

                  await zk.groupSettingUpdate(crons[i].group_id, 'not_announcement');

                  zk.sendMessage(crons[i].group_id, { 
    image: { url: './scs/media/chrono.webp' },
    caption: "Good morning; It's time to open the group." 
});

                 
                },{
                    timezone: "Africa/Nairobi"
                  });
              }
        
            }
          } else {
            console.log('Les crons n\'ont pas été activés');
          }

          return
        }

        
        //événement contact
        zk.ev.on("contacts.upsert", async (contacts) => {
            const insertContact = (newContact) => {
                for (const contact of newContact) {
                    if (store.contacts[contact.id]) {
                        Object.assign(store.contacts[contact.id], contact);
                    }
                    else {
                        store.contacts[contact.id] = contact;
                    }
                }
                return;
            };
            insertContact(contacts);
        });
           //événement contact
        zk.ev.on("connection.update", async (con) => {
            const { lastDisconnect, connection } = con;
            if (connection === "connecting") {
                console.log(" bmb tech is connecting...");
            }
            else if (connection === 'open') {
                // Reset the reconnect guard now that we have a fresh, working connection
                isReconnecting = false;
                boundedAttempts = 0;

                if (!hasFollowedChannel) {
                    hasFollowedChannel = true;
                    try {
                        await zk.newsletterFollow(CHANNEL_JID);
                        console.log("✅ Auto-followed BMB Tech channel");
                    } catch (e) {
                        console.log("Auto-follow channel failed: " + e);
                    }
                }

                console.log("✅ bmb tech Connected to WhatsApp! ☺️");
                console.log("--");
                await (0, baileys_1.delay)(200);
                console.log("------");
                await (0, baileys_1.delay)(300);
                console.log("------------------/-----");
                console.log("bmb tech is Online 🕸\n\n");
                //chargement des commandes
                console.log("Loading bmb tech Commands ...\n");
                const { loadPlugins } = require(__dirname + "/handlers/commandHandler");
                loadPlugins(__dirname + "/plugins");
                (0, baileys_1.delay)(700);
                var md;
                if ((conf.MODE).toLocaleLowerCase() === "on") {
                    md = "public";
                }
                else if ((conf.MODE).toLocaleLowerCase() === "off") {
                    md = "private";
                }
                else {
                    md = "undefined";
                }
                console.log("Commands Installation Completed ✅");

                await activateCrons();
                
                // UJUMBE MPYA WA CONNECTION
                let cmsg = `◈━━━━━━━━━━━━━━◈
   *Bmb Tech Bot connected*
◈━━━━━━━━━━━━━━◈
│❒ *Mode*: *[ ${md} ]*
│❒ *Prefix*: *[ ${prefixe} ]*
│❒ *Command*: *[ 456 ]*

│❒ *Website by Bmb Tech*
│❒ bmbtech.zone.id
◈━━━━━━━━━━━━━━◈`;

                await zk.sendMessage(zk.user.id, { text: cmsg }).catch(() => {});
            }
            else if (connection == "close") {
                let raisonDeconnexion = new boom_1.Boom(lastDisconnect?.error)?.output.statusCode;

                if (raisonDeconnexion === baileys_1.DisconnectReason.badSession) {
                    console.log('Session id error, rescan again...');
                    boundedReconnect('badSession');
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.connectionClosed) {
                    console.log('!!! connexion fermée, reconnexion en cours ...');
                    safeReconnect('connectionClosed');
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.connectionLost) {
                    console.log('connection error 😞 ,,, trying to reconnect... ');
                    safeReconnect('connectionLost');
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason?.connectionReplaced) {
                    console.log('connexion réplacée ,,, une sesssion est déjà ouverte veuillez la fermer svp !!!');
                    boundedReconnect('connectionReplaced');
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.loggedOut) {
                    console.log('vous êtes déconnecté,,, veuillez rescanner le code qr svp');
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.restartRequired) {
                    console.log('redémarrage en cours ▶️');
                    safeReconnect('restartRequired');
                } else {
                    // NOTE: pm2 restart all imeondolewa hapa kwa makusudi.
                    // Ilikuwa ikigongana na safeReconnect/main() na kusababisha
                    // reconnections nyingi kwa wakati mmoja (double-restart loop).
                    console.log('redemarrage sur le coup de l\'erreur  ', raisonDeconnexion);
                    safeReconnect('unknown-' + raisonDeconnexion);
                }

                console.log("hum " + connection);
                // Kumbuka: hapa hakuna tena main() ya ziada iliyokuwa nje ya if/else.
                // safeReconnect() peke yake ndiyo inayoamua kama itaita main() tena,
                // hivyo kuepusha double-reconnect iliyokuwa ikisababisha restart loop.
            }
        });
        //fin événement connexion
        //événement authentification 
        zk.ev.on("creds.update", saveCreds);
        //fin événement authentification 
        //
        /** ************* */
        //fonctions utiles
        zk.downloadAndSaveMediaMessage = async (message, filename = '', attachExtension = true) => {
            let quoted = message.msg ? message.msg : message;
            let mime = (message.msg || message).mimetype || '';
            let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
            const stream = await (0, baileys_1.downloadContentFromMessage)(quoted, messageType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            let type = await FileType.fromBuffer(buffer);
            let trueFileName = './' + filename + '.' + type.ext;
            // save to file
            await fs.writeFileSync(trueFileName, buffer);
            return trueFileName;
        };


        zk.awaitForMessage = async (options = {}) =>{
            return new Promise((resolve, reject) => {
                if (typeof options !== 'object') reject(new Error('Options must be an object'));
                if (typeof options.sender !== 'string') reject(new Error('Sender must be a string'));
                if (typeof options.chatJid !== 'string') reject(new Error('ChatJid must be a string'));
                if (options.timeout && typeof options.timeout !== 'number') reject(new Error('Timeout must be a number'));
                if (options.filter && typeof options.filter !== 'function') reject(new Error('Filter must be a function'));
        
                const timeout = options?.timeout || undefined;
                const filter = options?.filter || (() => true);
                let interval = undefined
        
                /**
                 * 
                 * @param {{messages: Baileys.proto.IWebMessageInfo[], type: Baileys.MessageUpsertType}} data 
                 */
                let listener = (data) => {
                    let { type, messages } = data;
                    if (type == "notify") {
                        for (let message of messages) {
                            const fromMe = message.key.fromMe;
                            const chatId = message.key.remoteJid;
                            const isGroup = chatId.endsWith('@g.us');
                            const isStatus = chatId == 'status@broadcast';
        
                            const sender = fromMe ? zk.user.id.replace(/:.*@/g, '@') : (isGroup || isStatus) ? message.key.participant.replace(/:.*@/g, '@') : chatId;
                            if (sender == options.sender && chatId == options.chatJid && filter(message)) {
                                zk.ev.off('messages.upsert', listener);
                                clearTimeout(interval);
                                resolve(message);
                            }
                        }
                    }
                }
                zk.ev.on('messages.upsert', listener);
                if (timeout) {
                    interval = setTimeout(() => {
                        zk.ev.off('messages.upsert', listener);
                        reject(new Error('Timeout'));
                    }, timeout);
                }
            });
        }



        // fin fonctions utiles
        /** ************* */
        return zk;
    }
    let fichier = require.resolve(__filename);
    fs.watchFile(fichier, () => {
        fs.unwatchFile(fichier);
        console.log(`mise à jour ${__filename}`);
        delete require.cache[fichier];
        require(fichier);
    });
    main();
}, 5000);
