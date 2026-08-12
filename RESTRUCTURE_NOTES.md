# BMB-TECH — Muundo Mpya wa Folders (Hatua ya 1)

## Kilichofanyika

1. **`plugins/<category>/`** — Command files zote (zilizokuwa `scs/*.js`) zimehamishwa
   kwenye folders kwa category, ikifuata `categorie` iliyokuwa imeandikwa ndani ya kila
   command tayari (mfano `plugins/Download/apk.js`, `plugins/Search/weather.js`).
   Hii ndiyo tabia ya NOVA-XMD (`plugins/AI/`, `plugins/Downloads/`, n.k) lakini bado
   ikitumia muundo wa BMB-TECH wa ndani (bmbtz registry, CommonJS).

2. **`handlers/commandHandler.js`** — Loader mpya (`loadPlugins()`) inayosoma `plugins/`
   kwa recursive (folder zote za ndani) badala ya ile `fs.readdirSync(__dirname + "/scs")`
   ya zamani iliyokuwa flat (folder moja tu).

3. **`index.js`** — Sehemu iliyokuwa inapakia commands moja kwa moja kutoka `/scs` sasa
   inaita `loadPlugins(__dirname + "/plugins")` kutoka `handlers/commandHandler.js`.
   Kila kitu kingine (Baileys connection, event handlers, n.k) hakijaguswa.

4. **`devbmb/`, `lib/`, `settings.js`** — Vimeachwa mahali pake pa asili (bado
   vinatumika na plugins zote kupitia `../../devbmb/...` na `../../settings`).
   Hazikuhamishwa ili kupunguza hatari ya kuvunja kitu bila sababu.

5. **`scs/` ya zamani imeondolewa** — files zake zote zimenakiliwa kwenye `plugins/`
   kabla ya kuondolewa; hakuna kilichopotea.

## Command files ambazo HAZIKUHAMISHWA (kwa makusudi)

- `xxx.js` — ilikuwa imeunganishwa na explicit/adult content API
- `one.js`, `view.js`, `view1.js`, `view2.js`, `view3.js`, `vv2.js` — command za
  "View Once auto-save" (kuhifadhi siri media za mtu bila ruhusa yake)

Hizi hazikuhamishwa wala hazikufutwa kutoka kwenye zip ya asili — ni feature
ambazo sikusaidia kuziendeleza.

## Uthibitisho uliofanyika

- `node -c` (syntax check) kwenye kila file 57 zilizohamishwa — zote sahihi
- Test ya moja kwa moja kuthibitisha relative requires (`../../devbmb/...`,
  `../../settings`) zinapatikana sahihi kabla ya kufikia external npm packages
- `package.json` haikubadilishwa — dependencies zote za asili bado zipo

## Hatua zijazo (bado hazijafanyika)

- Kubadilisha Baileys iliyofichwa (`bmbxmd-baileys`) na `@whiskeysockets/baileys`
  halisi kutoka npm, au fork nyingine kama ya NOVA-XMD
- Kubadilisha CommonJS (`require`/`module.exports`) kuwa ES Modules (`import`/`export`)
  kama NOVA-XMD, ikiwa ndiyo lengo la mwisho
- Kugawanya `index.js` (bado mistari 1000+) kuwa `handlers/connectionHandler.js`,
  `handlers/eventHandler.js` kama muundo wa NOVA-XMD

## Jinsi ya kujaribu

```bash
npm install
node index.js
```

**Muhimu:** Hakikisha una faili yako mwenyewe ya `.env` (haikuwa ndani ya zip hii
kwa sababu za usalama) yenye session/config zako halisi kabla ya kuendesha.

## Hatua ya hivi karibuni: `zk` → `client` rename

Jina la variable lililokuwa likishikilia Baileys socket limebadilishwa
kutoka `zk` kwenda `client` kwenye project nzima (files 62, nafasi 550),
ili kuendana na majina ya NOVA-XMD. Hii ilikuwa ni jina la variable tu —
si mabadiliko ya library au mfumo — Baileys socket ni ile ile.

Pia zimerekebishwa wakati huu:
- `.promote` na `.demote` — zilikuwa zinasoma `reply` pekee, sasa
  zinasoma `tag` (@mention) AU `reply`, sawa na `.remove`/`.add`
  zilizorekebishwa awali.
- `.add` — imeongezewa fallback: kama uthibitisho wa awali wa namba
  (`onWhatsApp`) utashindwa kimya kimya, namba hazitupwi moja kwa moja
  tena — zinaendelea kwenye hatua ya kuongeza kwenye group, na
  WhatsApp yenyewe ndiyo itaamua kama namba ipo. Pia imeongezwa
  logging ya kina (`console.log`) kwenye kila hatua ili iwe rahisi
  kuchunguza tatizo lolote la baadaye kupitia Heroku logs.

**Kumbuka:** `devbmb/ytdl-core.js` ina syntax error (obfuscated/minified
code iliyoharibika) — hii ilikuwepo tayari kwenye zip ya awali uliyotupa,
kabla ya kazi yoyote yetu. Haijatumika (haija-`require`iwa) popote kwenye
project inayotumika, kwa hiyo haiathiri utendaji wa bot, lakini kama
kuna command inayotegemea YouTube download isiyofanya kazi, hiyo faili
ndiyo chanzo — itahitaji kuandikwa upya kutoka mwanzo.
