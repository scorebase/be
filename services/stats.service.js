const GameweekService = require('./gameweek.service');
const {fn, col, literal} = require('sequelize');
const Picks = require('../models/picks.model');
const {statsErrors} = require('../errors');
const {ServiceError} = require('../errors/http_errors');
const PicksService = require('./picks.service');
const FixtureService = require('./fixture.service');
const PickItem = require('../models/pickItem.model');

class StatsService {
    static async getRoundStats(gameweekId) {
        await GameweekService.loadGameweek(gameweekId);

        const { next } = await GameweekService.getGameweekState();

        if(gameweekId === next?.id) throw new ServiceError(statsErrors.STAT_ACCESS_DENIED);

        const average = await Picks.findOne({
            attributes : [
                [fn('AVG', col('total_points')), 'avg_pts']
            ],
            where : { gameweek_id : gameweekId },
            raw : true
        });
        let average_points = average.avg_pts;
        if(average_points) average_points = Math.floor(+average_points);

        const max_exacts = await Picks.findAll({
            attributes : ['player_id', [fn('MAX', col('exact')), 'exact_picks']],
            where : { gameweek_id: gameweekId },
            group : 'player_id',
            order : literal('exact_picks DESC, total_points DESC, `close` DESC, result DESC'),
            limit : 1,
            raw : true
        });

        const highest_pts = await Picks.findAll({
            attributes : ['player_id', [fn('MAX', col('total_points')), 'points']],
            where : { gameweek_id: gameweekId },
            group : 'player_id',
            order : literal('points DESC, exact DESC, `close` DESC, result DESC'),
            limit : 1,
            raw : true
        });

        const fixtures = await FixtureService.getFixtures(gameweekId);
        const fixtureIds = fixtures.map(f => f.id);

        const picks_fixtures_stats = await PickItem.findAll({
            attributes : [
                'fixture_id',
                [literal('COUNT(IF(home_pick > away_pick, 1, NULL))'), 'home_wins'],
                [literal('COUNT(IF(home_pick < away_pick, 1, NULL))'), 'away_wins'],
                [literal('COUNT(IF(home_pick = away_pick, 1, NULL))'), 'draws']
            ],
            where : { fixture_id : fixtureIds },
            group : 'fixture_id'
        });

        return {
            gameweek_id: gameweekId,
            average_points,
            max_exacts : max_exacts[0],
            highest_points : highest_pts[0],
            picks_stats : picks_fixtures_stats
        };
    }

    static async playerRoundRank(playerId, roundId) {
        const ranks = await PicksService.getRoundRanks(roundId);

        let l = 0, r = ranks.length - 1;

        while(l <= r) {
            const mid = Math.floor(l + (r - l)/2);
            if(ranks[mid].player_id === playerId) {
                return ranks[mid].rank;
            } else if(ranks[mid].player_id > playerId) {
                r = mid - 1;
            } else {
                l = mid + 1;
            }
        }
        //no rank
        return null;
    }

    static async playerTotalPoints(playerId) {
        const total = await Picks.sum('total_points', {
            where : { player_id : playerId }
        });

        return total;
    }
}

module.exports = StatsService;