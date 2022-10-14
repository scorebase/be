module.exports.playerLeaguesQuery = (userId, currentGW) => {
    return `
           WITH cte AS (
            SELECT lm.player_id, 
            league_id, 
            lg.name,
            lg.administrator_id,
            lg.type,
            RANK() OVER (PARTITION BY lm.league_id 
                ORDER BY SUM(pks.total_points)  DESC, 
                SUM(pks.exact) DESC, 
                SUM(pks.close) DESC, 
                SUM(pks.result) DESC) player_rank,
            RANK() OVER (PARTITION BY lm.league_id 
                ORDER BY SUM(p_pks.total_points)  DESC, 
                SUM(p_pks.exact) DESC, 
                SUM(p_pks.close) DESC, 
                SUM(p_pks.result) DESC) previous_rank
            FROM league_members AS lm
            INNER JOIN leagues AS lg ON lm.league_id = lg.id
            LEFT OUTER JOIN picks AS pks 
            ON pks.player_id = lm.player_id AND 
            pks.gameweek_id >= lg.starting_gameweek
            
            LEFT JOIN (
                SELECT 
                SUM(total_points) total_points, 
                SUM(exact) exact, 
                SUM('close') 'close', 
                SUM(result) result, 
                p_pks.player_id FROM picks AS p_pks 
                INNER JOIN league_members lm ON lm.player_id = p_pks.player_id
                INNER JOIN leagues AS lg ON lm.league_id = lg.id
                
                WHERE 
                p_pks.gameweek_id < ${currentGW} AND 
                p_pks.gameweek_id >= lg.starting_gameweek
                
                GROUP BY p_pks.player_id
            ) p_pks ON lm.player_id = p_pks.player_id
            
            
            WHERE lm.is_suspended = 0
            GROUP BY lm.player_id, lm.league_id
            ORDER BY league_id ASC, lm.player_id ASC
        )

        SELECT * FROM cte WHERE player_id = ${userId};
    `;
};

module.exports.leagueStandingQuery = (leagueId, currentGW, skip, limit, starting_gameweek) => {
    return `
    SELECT 
        RANK() OVER (
             ORDER BY SUM(pks.total_points) DESC,  
             SUM(pks.exact) DESC, 
             SUM(pks.close) DESC, 
             SUM(pks.result) DESC) rank, 
        RANK() OVER ( 
            ORDER BY p_pks.total_points DESC,  
            p_pks.exact DESC, 
            p_pks.close DESC, 
            p_pks.result DESC) previous_rank, 
        lm.player_id, 
        users.username, 
        users.full_name, 
        SUM(pks.total_points) AS total_pts, 
        c_picks.total_points AS round_score, 
        SUM(pks.exact) AS total_exact, 
        SUM(pks.close) AS total_close, 
        SUM(pks.result) AS total_outcome
        FROM league_members AS lm
        LEFT  JOIN picks AS pks ON 
            pks.player_id = lm.player_id AND 
            pks.gameweek_id >= ${starting_gameweek}
        LEFT JOIN (
            SELECT 
            SUM(total_points) total_points, 
            SUM(exact) exact, 
            SUM('close') 'close', 
            SUM(result) result, 
            player_id FROM picks AS p_pks WHERE 
            p_pks.gameweek_id < ${currentGW} AND 
            p_pks.gameweek_id >= ${starting_gameweek}
            GROUP BY player_id
        ) p_pks ON lm.player_id = p_pks.player_id
        LEFT JOIN picks AS c_picks ON 
            c_picks.player_id = lm.player_id AND 
            c_picks.gameweek_id = ${currentGW}
        INNER JOIN users ON users.id = lm.player_id
        WHERE lm.league_id = ${leagueId}
        AND lm.is_suspended = 0
        GROUP BY player_id
        ORDER BY rank ASC, player_id ASC
        LIMIT ${limit} OFFSET ${skip};
    `;
};