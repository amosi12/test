const { bmbtz } = require('../../devbmb/bmbtz');

/**
 * promoteall / demoteall
 *
 * Bulk-promotes/demotes every eligible group member. Both require the
 * bot itself to be a group admin, and the command caller to be an
 * admin or bot superUser (owner) — same access rules the existing
 * promote/demote commands in groupe.js already use.
 */
function registerBulkCommand(nomCom, action, label, reaction) {
    bmbtz({
        nomCom,
        categorie: 'Group',
        reaction
    }, async (dest, client, commandeOptions) => {
        const { repondre, infosGroupe, verifGroupe, superUser, idBot } = commandeOptions;

        if (!verifGroupe) {
            return repondre('🚫 *This command is for group use only.*');
        }

        const membresGroupe = await infosGroupe.participants;

        const memberAdmin = (list) => {
            const admin = [];
            for (const m of list) {
                if (m.admin == null) continue;
                admin.push(m.id);
            }
            return admin;
        };
        const admins = memberAdmin(membresGroupe);
        const callerId = commandeOptions.auteurMessage;
        const callerIsAdmin = admins.includes(callerId);
        const botIsAdmin = admins.includes(idBot);

        if (!(callerIsAdmin || superUser)) {
            return repondre('Sorry, I cannot perform this action because you are not an administrator of the group.');
        }
        if (!botIsAdmin) {
            return repondre('Sorry, I cannot perform this action because I am not an administrator of the group.');
        }

        let targets;
        if (action === 'promote') {
            targets = membresGroupe.filter((m) => m.admin == null && m.id !== idBot).map((m) => m.id);
        } else {
            targets = membresGroupe.filter((m) => m.admin != null && m.id !== idBot).map((m) => m.id);
        }

        if (targets.length === 0) {
            return repondre(`No members to ${nomCom.replace('all', '')}.`);
        }

        await repondre(`⏳ ${label} ${targets.length} member(s)...`);

        let success = 0;
        for (const jid of targets) {
            try {
                await client.groupParticipantsUpdate(dest, [jid], action);
                success++;
                await new Promise((r) => setTimeout(r, 700)); // avoid rate limiting
            } catch (e) {
                // continue with the rest even if one fails
            }
        }

        return repondre(`✅ ${label} complete: ${success}/${targets.length} member(s).`);
    });
}

registerBulkCommand('promoteall', 'promote', 'Promoting', '⬆️');
registerBulkCommand('demoteall', 'demote', 'Demoting', '⬇️');
