const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const joi = require('joi');
const { TOKEN_HEADER, LEAGUE_TYPES } = require('../../helpers/constants');
const AuthService = require('../../services/auth.service');
const leaguesMock = require('../helpers/leagues.mock');
const server = require('../..');
const { leagueErrors } = require('../../errors');
const { leagueMessages } = require('../../helpers/messages');
const LeagueService = require('../../services/league.service');

chai.use(chaiHttp);

describe('POST /league', () => {
    let token = AuthService.generateToken({ id : 1 });
    it('should create a new league successfully', (done) => {
        chai.request(server)
        .post('/league')
        .send(leaguesMock[0])
        .set(TOKEN_HEADER, token)
        .then(res => {
            expect(res).to.have.status(200);
            const schema = joi.object({
                id: joi.number().integer().required(),
                name: joi.string().valid(leaguesMock[0].name).required(),
                invite_code: joi.string().alphanum().required(),
                max_participants: joi.number().integer().valid(leaguesMock[0].max_participants).required(),
                type: joi.number().integer().valid(LEAGUE_TYPES.general, LEAGUE_TYPES.public, LEAGUE_TYPES.private),
                starting_gameweek: joi.number().integer().valid(1).required(),
                administrator_id : joi.number().valid(1).required(),
                updatedAt: joi.date().required(),
                createdAt: joi.date().required(),
                is_closed : joi.boolean().valid().required()
            })
            joi.assert(res.body.data, schema);
            done();
        })
        .catch(done)
    })

    it('should fail to create leagues if validation does not pass', (done) => {
        chai.request(server)
        .post('/league')
        .send({...leaguesMock[0], name : 'ab', type : 0})
        .set(TOKEN_HEADER, token)
        .then(res => {
            expect(res).to.have.status(422);
            done()
        })
        .catch(done)
    })
})


describe('PUT /league/:leagueId', () => {
    let token = AuthService.generateToken({ id : 1 });
    let tokenAnotherUser = AuthService.generateToken({ id : 2 });
    let leagueUpdates = { name : 'Test League One - Update', max_participants : leaguesMock[0].max_participants + 1, is_closed : true };
    it('should update a league successfully', (done) => {
        chai.request(server)
        .put('/league/1')
        .send(leagueUpdates)
        .set(TOKEN_HEADER, token)
        .then(res => {
            expect(res).to.have.status(200);
            const schema = joi.object({
                id: joi.number().integer().required(),
                name: joi.string().valid(leagueUpdates.name).required(),
                invite_code: joi.string().alphanum().required(),
                max_participants: joi.number().integer().valid(leagueUpdates.max_participants).required(),
                type: joi.number().integer().valid(LEAGUE_TYPES.general, LEAGUE_TYPES.public, LEAGUE_TYPES.private),
                starting_gameweek: joi.number().integer().valid(1).required(),
                administrator_id : joi.number().valid(1).required(),
                updatedAt: joi.date().required(),
                createdAt: joi.date().required(),
                is_closed : joi.boolean().valid(leagueUpdates.is_closed).required()
            })
            joi.assert(res.body.data, schema);
            done()
        })
        .catch(done)
    })

    it('should return forbidden error if a non-admin tries to update a league', (done) => {
        chai.request(server)
        .put('/league/1')
        .send(leagueUpdates)
        .set(TOKEN_HEADER, tokenAnotherUser)
        .then(res => {
            expect(res).to.have.status(403);
            const schema = joi.object({
                status : 'error',
                data : null,
                message : joi.string().valid(leagueErrors.LEAGUE_PERMISSION_ERROR).required()
            })
            joi.assert(res.body, schema);
            done()
        })
        .catch(done)
    })

    it('should return 404 if league is not found', (done) => {
        chai.request(server)
        .put('/league/999999')
        .send(leagueUpdates)
        .set(TOKEN_HEADER, token)
        .then(res => {
            expect(res).to.have.status(404);
            expect(res.body.message).to.equal(leagueErrors.LEAGUE_NOT_FOUND)
            done()
        })
        .catch(done)
    })
})


describe('PUT /league/:leagueId/code', () => {
    
    let token = AuthService.generateToken({ id : 1 });
    it('should successfully update a league code.', async () => {
        return new Promise(async function (resolve) {
            const { invite_code : oldCode } = await LeagueService.loadLeague(1);
            chai.request(server)
            .put('/league/1/code')
            .set(TOKEN_HEADER, token)
            .then(res => {
                expect(res).to.have.status(200);
                const schema = joi.object({
                    status : 'success',
                    data : joi.object({
                        newCode : joi.string().not(oldCode).required()
                    }),
                    message : joi.string().valid(leagueMessages.NEW_CODE_SUCCESS).required()
                })
                joi.assert(res.body, schema);
                resolve()
            })
        })
    })
})