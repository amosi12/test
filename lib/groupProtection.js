"use strict";
/**
 * groupProtection.js
 *
 * Shared storage for group-level protection toggles (antispam, antisticker,
 * and any future similar features), ported in spirit from NOVA-XMD's
 * database/config.js getGroupSettings()/updateGroupSetting() but as a
 * simple JSON file store to match how BMB-TECH's other lib/*.js files
 * (antibot.js, welcome.js) already persist data — no new database
 * dependency required.
 *
 * Each feature's value is one of: 'off' | 'warn' | 'kick'
 *
 * Warn counts here are tracked PER GROUP PER USER (unlike lib/warn.js,
 * which is a single global count per user) since spam/sticker behavior
 * should reset per group.
 */
const fs = require('fs');
const path = require('path');

const settingsFilePath = path.join(__dirname, '../asset/groupProtection.json');
const warnFilePath = path.join(__dirname, '../asset/groupProtectionWarns.json');

function loadJson(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
        return {};
    }
}

function saveJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

if (!fs.existsSync(settingsFilePath)) saveJson(settingsFilePath, {});
if (!fs.existsSync(warnFilePath)) saveJson(warnFilePath, {});

/**
 * @param {string} groupId
 * @param {string} feature - e.g. "antispam" | "antisticker"
 * @returns {'off'|'warn'|'kick'}
 */
async function getGroupFeature(groupId, feature) {
    const data = loadJson(settingsFilePath);
    return data[groupId]?.[feature] || 'off';
}

/**
 * @param {string} groupId
 * @param {string} feature
 * @param {'off'|'warn'|'kick'} value
 */
async function setGroupFeature(groupId, feature, value) {
    const data = loadJson(settingsFilePath);
    data[groupId] = data[groupId] || {};
    data[groupId][feature] = value;
    saveJson(settingsFilePath, data);
}

/**
 * Increments and returns the warn count for a user in a specific group,
 * scoped by feature so antispam warns and antisticker warns don't mix.
 */
async function addGroupWarn(groupId, feature, userNum) {
    const data = loadJson(warnFilePath);
    data[groupId] = data[groupId] || {};
    data[groupId][feature] = data[groupId][feature] || {};
    data[groupId][feature][userNum] = (data[groupId][feature][userNum] || 0) + 1;
    saveJson(warnFilePath, data);
    return data[groupId][feature][userNum];
}

async function resetGroupWarn(groupId, feature, userNum) {
    const data = loadJson(warnFilePath);
    if (data[groupId]?.[feature]) {
        delete data[groupId][feature][userNum];
        saveJson(warnFilePath, data);
    }
}

module.exports = {
    getGroupFeature,
    setGroupFeature,
    addGroupWarn,
    resetGroupWarn,
};
