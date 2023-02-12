module.exports.playerLeaguesQuery = (userId, currentGW) => {
    return `
        SELECT c.*, p.player_rank AS previous_rank 
        FROM (
            SELECT lm.player_id, 
            league_id, 
            lg.name,
            lg.administrator_id,
            lg.type,
            CASE
                WHEN lg.type = 2 THEN lg.invite_code
            END AS invite_code,
            RANK() OVER (PARTITION BY lm.league_id 
                ORDER BY IFNULL(SUM(pks.total_points), 0)  DESC, 
                IFNULL(SUM(pks.exact), 0) DESC, 
                IFNULL(SUM(pks.close), 0) DESC, 
                IFNULL(SUM(pks.result), 0) DESC) player_rank
            FROM league_members AS lm
            INNER JOIN leagues AS lg ON lm.league_id = lg.id
            LEFT OUTER JOIN picks AS pks 
            ON pks.player_id = lm.player_id AND 
            pks.gameweek_id >= lg.starting_gameweek
            
            WHERE lm.is_suspended = 0
            GROUP BY lm.player_id, lm.league_id
            ORDER BY league_id ASC, lm.player_id ASC
        ) AS c
        INNER JOIN (
        	SELECT * FROM (
                SELECT
                league_id,
                lm.player_id,
                RANK() OVER (PARTITION BY lm.league_id 
                    ORDER BY IFNULL(SUM(pks.total_points), 0)  DESC, 
                    IFNULL(SUM(pks.exact), 0) DESC, 
                    IFNULL(SUM(pks.close), 0) DESC, 
                    IFNULL(SUM(pks.result), 0) DESC) player_rank
                FROM league_members AS lm
                INNER JOIN leagues AS lg ON lm.league_id = lg.id
                LEFT OUTER JOIN picks AS pks 
                ON pks.player_id = lm.player_id AND 
                pks.gameweek_id >= lg.starting_gameweek AND pks.gameweek_id < ${currentGW}
                WHERE lm.is_suspended = 0
                GROUP BY lm.player_id, lm.league_id
                ORDER BY league_id ASC, lm.player_id ASC
            ) AS pr
			WHERE pr.player_id = ${userId}
        ) p ON p.league_id = c.league_id
        
		WHERE c.player_id = ${userId};
    `;
};

module.exports.leagueStandingQuery = (leagueId, currentGW, skip, limit, starting_gameweek) => {
    return `
    SELECT 
        RANK() OVER (
             ORDER BY IFNULL(SUM(pks.total_points), 0) DESC,  
             IFNULL(SUM(pks.exact), 0) DESC, 
             IFNULL(SUM(pks.close), 0) DESC, 
             IFNULL(SUM(pks.result), 0) DESC) current_rank, 
        RANK() OVER ( 
            ORDER BY p_pks.total_points DESC,  
            p_pks.exact DESC, 
            p_pks.close DESC, 
            p_pks.result DESC) previous_rank, 
        lm.player_id, 
        users.username, 
        users.full_name, 
        IFNULL(SUM(pks.total_points), 0) AS total_pts, 
        IFNULL(c_picks.total_points, 0) AS round_score, 
        IFNULL(SUM(pks.exact),0) AS total_exact, 
        IFNULL(SUM(pks.close),0) AS total_close, 
        IFNULL(SUM(pks.result),0) AS total_outcome
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
            c_picks.gameweek_id = ${currentGW} AND
            c_picks.gameweek_id >= ${starting_gameweek}
        INNER JOIN users ON users.id = lm.player_id
        WHERE lm.league_id = ${leagueId}
        AND lm.is_suspended = 0
        GROUP BY player_id
        ORDER BY current_rank ASC, player_id ASC
        LIMIT ${limit} OFFSET ${skip};
    `;
};