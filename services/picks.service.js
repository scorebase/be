const { NotFoundError, ServiceError } = require('../errors/http_errors');
const { picksErrors, gameweekErrors } = require('../errors');
const GameWeek = require('../models/gameweek.model');
const Picks = require('../models/picks.model');
const PickItem = require('../models/pickItem.model');
const { Op } = require('sequelize');

const {GAMEWEEK_NOT_FOUND} = gameweekErrors;
const {
    MASTER_PICK_LESS_THAN_ONE,
    MASTER_PICK_GREATER_THAN_ONE,
    PICK_ALREADY_EXISTS,
    PICK_NOT_FOUND} = picksErrors;

class PicksService {
    static async createPick(pick, gameweekId) {
        const gameweekExists = await GameWeek.findByPk(gameweekId);
        if(!gameweekExists) throw new NotFoundError(GAMEWEEK_NOT_FOUND);

        const gameweekPickExists = await Picks.findOne({where: {gameweek_id: gameweekId}});
        if(gameweekPickExists) throw new ServiceError(PICK_ALREADY_EXISTS);

        const { player_id, total_points, pick_items } = pick;
        
        let count = 0;
        for(let i = 0; i < pick_items.length; i++) {
            if(pick_items[i].is_master_pick === true) count++;
            if(count > 1) break;
        }

        if(count < 1) throw new ServiceError(MASTER_PICK_LESS_THAN_ONE);
        if(count > 1) throw new ServiceError(MASTER_PICK_GREATER_THAN_ONE);

        const gameweek_id = gameweekId;
        const picksData = await Picks.create({ player_id, gameweek_id, total_points });

        pick_items.forEach(item => item.picks_id = picksData.id);
        await PickItem.bulkCreate(pick_items);

        return pick;
    }

    static async updatePick(pick, pickId) {
        const pickExists = await Picks.findByPk(pickId);
        if(!pickExists) throw new ServiceError(PICK_NOT_FOUND);

        let count = 0;
        for(let i = 0; i < pick.pick_items.length; i++) {
            if(pick.pick_items[i].is_master_pick === true) count++;
            if(count > 1) break;
        }

        if(count < 1) throw new ServiceError(MASTER_PICK_LESS_THAN_ONE);
        if(count > 1) throw new ServiceError(MASTER_PICK_GREATER_THAN_ONE);

        await Picks.update(pick, {where: {id: pickId}});
        pick.pick_items.forEach(item => {
            PickItem.update(item, {where: {
                [Op.and] : [{picks_id : pickId}, {fixture_id: item.fixture_id}]
            }});
        });

        return pick;
    }

    static async deletePick(pickId) {
        const pickExists = await Picks.findByPk(pickId);
        if(!pickExists) throw new ServiceError(PICK_NOT_FOUND);

        await PickItem.destroy({ where: {picks_id: pickId} });
        await Picks.destroy({ where: { id : pickId }});

        return null;

    }

    static async getPick(playerId, gameweekId) {
        const picksData = await Picks.findOne({ where: {
            [Op.and] : [{player_id: playerId}, {gameweek_id: gameweekId}]
        }});
        const pickItemsData = await PickItem.findAll({where: {picks_id: picksData.id}});

        const updatedPicksData = { ...picksData.dataValues, pick_items: pickItemsData };
        return updatedPicksData;
    }
}

module.exports = PicksService;