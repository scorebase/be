const { NotFoundError, ServiceError } = require('../errors/http_errors');
const { picksErrors, gameweekErrors } = require('../errors');
const Picks = require('../models/picks.model');
const PickItem = require('../models/pickItem.model');
const { Op } = require('sequelize');
const GameweekService = require('./gameweek.service');

const {GAMEWEEK_NOT_FOUND} = gameweekErrors;
const {
    MASTER_PICK_LESS_THAN_ONE,
    MASTER_PICK_GREATER_THAN_ONE,
    PICK_ALREADY_EXISTS,
    PICK_NOT_FOUND,
    PICK_ACCESS_DENIED} = picksErrors;

class PicksService {
    static async createPick(pick, player_id) {
        //get the next gamweek (which a player can make pick for)
        const { next : gameweekExists } = await GameweekService.getGameweekState();

        if(!gameweekExists) throw new NotFoundError(GAMEWEEK_NOT_FOUND);

        this.deadlinePassed(gameweekExists.deadline);

        const gameweekPickExists = await Picks.findOne({where: { gameweek_id: gameweekExists.id, player_id }});
        if(gameweekPickExists) throw new ServiceError(PICK_ALREADY_EXISTS);

        const { pick_items } = pick;

        let count = 0;
        for(let i = 0; i < pick_items.length; i++) {
            if(pick_items[i].is_master_pick === true) count++;
            if(count > 1) break;
        }

        if(count < 1) throw new ServiceError(MASTER_PICK_LESS_THAN_ONE);
        if(count > 1) throw new ServiceError(MASTER_PICK_GREATER_THAN_ONE);

        const gameweek_id = gameweekExists.id;
        const picksData = await Picks.create({ player_id, gameweek_id });

        pick_items.forEach(item => item.picks_id = picksData.id);
        const pickItemsData = await PickItem.bulkCreate(pick_items);

        return { ...picksData.dataValues, pick_items: pickItemsData};
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

        let count = 0;
        for(let i = 0; i < pick.pick_items.length; i++) {
            if(pick.pick_items[i].is_master_pick === true) count++;
            if(count > 1) break;
        }

        if(count < 1) throw new ServiceError(MASTER_PICK_LESS_THAN_ONE);
        if(count > 1) throw new ServiceError(MASTER_PICK_GREATER_THAN_ONE);

        await pickExists.update(pick);
        pick.pick_items.forEach(item => {
            PickItem.update(item, {where: {
                [Op.and] : [{ picks_id : pickExists.id }, { fixture_id: item.fixture_id }]
            }});
        });

        return pick;
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