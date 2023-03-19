module.exports.picksNotMadeQuery = (nextGw) => {
    return `
        SELECT email, full_name
        FROM users
        LEFT JOIN picks
            ON picks.player_id = users.id
            and picks.gameweek_id = ${nextGw}
            WHERE picks.gameweek_id IS NULL
    `;
};