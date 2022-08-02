const { NotFoundError, ServiceError } = require('../errors/http_errors');
const { picksErrors, gameweekErrors } = require('../errors');
const Picks = require('../models/picks.model');
const PickItem = require('../models/pickItem.model');
const { Op } = require('sequelize');
const GameweekService = require('./gameweek.service');
const FixtureService = require('./fixture.service');
const sequelize = require('../config/db');

const {GAMEWEEK_NOT_FOUND} = gameweekErrors;
const {
    MASTER_PICK_LESS_THAN_ONE,
    MASTER_PICK_GREATER_THAN_ONE,
    PICK_ALREADY_EXISTS,
    PICK_NOT_FOUND,
    PICK_ACCESS_DENIED,
    INVALID_PICKS
} = picksErrors;

class PicksService {
    static async createPick(pick, player_id) {
        //get the next gamweek (which a player can make pick for)
        const { next : gameweekExists } = await GameweekService.getGameweekState();

        if(!gameweekExists) throw new NotFoundError(GAMEWEEK_NOT_FOUND);

        this.deadlinePassed(gameweekExists.deadline);

        const gameweekPickExists = await Picks.findOne({where: { gameweek_id: gameweekExists.id, player_id }});
        if(gameweekPickExists) throw new ServiceError(PICK_ALREADY_EXISTS);

        const { pick_items } = pick;

        const gwFixturesIds = await FixtureService.getCurrentFixturesIds();

        if(!gwFixturesIds.length || (pick_items.length !== gwFixturesIds.length)) throw new ServiceError(INVALID_PICKS);

        const fixtureIds = new Set(gwFixturesIds);

        let count = 0;
        for(let i = 0; i < pick_items.length; i++) {
            if(pick_items[i].is_master_pick === true) count++;
            fixtureIds.delete(pick_items[i].fixture_id);
        }

        if(fixtureIds.size) throw new ServiceError(INVALID_PICKS);

        if(count < 1) throw new ServiceError(MASTER_PICK_LESS_THAN_ONE);
        if(count > 1) throw new ServiceError(MASTER_PICK_GREATER_THAN_ONE);

        const gameweek_id = gameweekExists.id;

        const t = await sequelize.transaction();
        try {
            const picksData = await Picks.create({ player_id, gameweek_id }, { transaction : t });

            pick_items.forEach(item => item.picks_id = picksData.id);
            const pickItemsData = await PickItem.bulkCreate(pick_items, { transaction : t });

            await t.commit();

            return { ...picksData.dataValues, pick_items: pickItemsData};
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    static async updatePick(pick, player_id) {
        //get the next gamweek (which a player can make pick for)
        const { next : gameweek  } = await GameweekService.getGameweekState();
        if(!gameweek) throw new NotFoundError(PICK_NOT_FOUND);

        const pickExists = await Picks.findOne({
            where: { player_id, gameweek_id : gameweek.id }
        });
        if(!pickExists) throw new NotFoundError(PICK_NOT_FOUND);

        this.deadlinePassed(gameweek.deadline);

        const { pick_items } = pick;
        const gwFixturesIds = await FixtureService.getCurrentFixturesIds();

        const fixtureIds = new Set(gwFixturesIds);
        let count = 0;
        let masterFixture;
        for(let i = 0; i < pick_items.length; i++) {
            if(pick_items[i].is_master_pick === true) {
                if(fixtureIds.has(pick_items[i].fixture_id)) {
                    masterFixture = pick_items[i].fixture_id;
                    count++;
                }
            };
            if(count > 1) break;
        }

        if(count > 1) throw new ServiceError(MASTER_PICK_GREATER_THAN_ONE);

        const masterPick = await PickItem.findOne({ where : { picks_id : pickExists.id, is_master_pick : true }});
        
        if(count === 0) {
            //if no new master_pick is sent, we need to make sure
            //that the master pick fixture is not part of the new update
            if(pick_items.find(item => item.fixture_id === masterPick.fixture_id)) {
                throw new ServiceError(MASTER_PICK_LESS_THAN_ONE);
            }
        }
        const t = await sequelize.transaction();
        try {
            if(count === 1 && !(masterPick.fixture_id === masterFixture)) {
                //if there is a new master_pick, and it is not the previous master_pick,
                //remove previous master_pick
                masterPick.is_master_pick = false;
                await masterPick.save({ transaction : t });
            }

            for(const item of pick_items) {
                await PickItem.update(item, { transaction : t ,where: {
                    [Op.and] : [{ picks_id : pickExists.id }, { fixture_id: item.fixture_id }]
                }});
            }
            await t.commit();
            return pick;
        } catch(err) {
            await t.rollback();
            throw err;
        }

    }

    static async getPick(playerId, userId, gameweekId) {
        //get the next gamweek (which a player can make pick for)
        const { next } = await GameweekService.getGameweekState();

        //if gameweek is a future gameweek, throw not found
        if(next && (gameweekId > next.id)) throw new NotFoundError(GAMEWEEK_NOT_FOUND);

        //if another player is trying to get pick of a player and it is for next gameweek, deny access.
        if((+playerId !== userId) && (next && +gameweekId === next.id)) throw new ServiceError(PICK_ACCESS_DENIED);
            
        const picksData = await Picks.findOne({ where: {
            [Op.and] : [{ player_id: playerId }, { gameweek_id: gameweekId }]
        }, attributes : {
            exclude : ['gameweek_id', 'createdAt']
        }});
        if(!picksData) return { pick_items : [] };
        const pickItemsData = await PickItem.findAll(
            { where: { picks_id: picksData.id },
                attributes : { exclude : ['picks_id', 'createdAt', 'id'] }
            });

        const returnedPicksData = { ...picksData.dataValues, pick_items: pickItemsData };
        return returnedPicksData;
    }

    static async deadlinePassed(deadline){
        if(new Date().getTime() >= new Date(deadline).getTime())
            throw new ServiceError(PICK_ACCESS_DENIED);
    }
}

module.exports = PicksService;