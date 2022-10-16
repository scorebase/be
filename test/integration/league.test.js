const { expect } = require('chai');
const chai = require('chai');
const joi = require('joi');
const { TOKEN_HEADER, LEAGUE_TYPES } = require('../../helpers/constants');
const AuthService = require('../../services/auth.service');
const leaguesMock = require('../helpers/leagues.mock');
const server = require('../..');
const { leagueErrors } = require('../../errors');
const { leagueMessages } = require('../../helpers/messages');
const LeagueService = require('../../services/league.service');
const League = require('../../models/league.model');
const LeagueMember = require('../../models/league_member.model');
const users = require('../helpers/users.mock');
const User = require('../../models/user.model');

describe('LEAGUE TESTS', () => {
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
            .put('/league/3')
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

        it('should open league to new entries successfully', (done) => {
            let newUpdates = { ...leagueUpdates, is_closed : false };
            chai.request(server)
            .put('/league/3')
            .send(newUpdates)
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
                    is_closed : joi.boolean().valid(newUpdates.is_closed).required()
                })
                joi.assert(res.body.data, schema);
                done()
            })
            .catch(done)
        })

        it('should return forbidden error if a non-admin tries to update a league', (done) => {
            chai.request(server)
            .put('/league/3')
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

    describe('GET /league/:leagueId', () => {
        it('should fetch a league successfully', (done) => {
            chai.request(server)
            .get('/league/3')
            .then(res => {
                expect(res).to.have.status(200);
                const schema = joi.object({
                    id: joi.number().integer().required(),
                    name: joi.string().required(),
                    max_participants: joi.number().integer().required(),
                    type: joi.number().integer().valid(LEAGUE_TYPES.general, LEAGUE_TYPES.public, LEAGUE_TYPES.private),
                    starting_gameweek: joi.number().integer().valid(1).required(),
                    administrator_id : joi.number().valid(1).required(),
                    updatedAt: joi.date().required(),
                    createdAt: joi.date().required(),
                    is_closed : joi.number().integer().min(0).max(1).required(),
                    invite_code : joi.string().allow(null).required(),
                    members : joi.array().items({
                        name : joi.string().required(),
                        id : joi.number().integer()
                    })
                })
                joi.assert(res.body.data, schema);
                done()
            })
            .catch(done)
        })

        it('should return not found error if league is invalid', (done) => {
            chai.request(server)
                .get('/league/999999')
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
        it('should successfully update a league code.', () => {
            return new Promise(async function (resolve, reject) {
                const { invite_code : oldCode } = await LeagueService.loadLeague(1);
                chai.request(server)
                .put('/league/3/code')
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
                .catch(reject)
            })
        })
    })

    describe('PUT /league/join', () => {
        let token = AuthService.generateToken({ id : 1 });
        let tokenUserTwo = AuthService.generateToken({ id : 2 });
        let tokenUserThree = AuthService.generateToken({ id : 3 });
        it('join league successfully.', () => {
            return new Promise(async function (resolve, reject) {
                const { invite_code } = await League.findByPk(3);
                chai.request(server)
                .post('/league/join')
                .send({ invite_code })
                .set(TOKEN_HEADER, tokenUserTwo)
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body.message).to.equal(leagueMessages.LEAGUE_JOIN_SUCCESS)
                })
                .then(async () => {
                    const userInLeague = await LeagueMember.findOne({ where : { player_id : 2, league_id : 1}});
                    if(!userInLeague) {
                        reject(new Error("User not present in league."))
                    }
                    resolve();
                })
                .catch(reject)
            })
        })
        it('should fail if user is already in the league.', () => {
            return new Promise(async function (resolve, reject) {
                const { invite_code } = await League.findByPk(3);
                chai.request(server)
                .post('/league/join')
                .send({ invite_code })
                .set(TOKEN_HEADER, tokenUserTwo)
                .then(res => {
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal(leagueErrors.LEAGUE_ALREADY_JOINED)
                    resolve();
                })
                .catch(reject)
            })
        })

        it('should fail if invite_code is not found.', (done) => {
            chai.request(server)
            .post('/league/join')
            .send({invite_code : 'abcdefg'})
            .set(TOKEN_HEADER, token)
            .then(res => {
                expect(res).to.have.status(404);
                expect(res.body.message).to.equal(leagueErrors.INVALID_LEAGUE_CODE)
                done()
            })
            .catch(done)
        })

        it('should fail if invite_code is not provided.', (done) => {
            chai.request(server)
            .post('/league/join')
            .send({})
            .set(TOKEN_HEADER, token)
            .then(res => {
                expect(res).to.have.status(422);
                done()
            })
            .catch(done)
        })

        it('should fail if league is closed to new entries', () => {
            return new Promise(async function (resolve, reject) {
                const league = await LeagueService.loadLeague(3);
                league.is_closed = true;
                await league.save();
                chai.request(server)
                .post('/league/join')
                .send({ invite_code : league.invite_code })
                .set(TOKEN_HEADER, tokenUserThree)
                .then(res => {
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal(leagueErrors.LEAGUE_CLOSED)
                    resolve();
                })
                .catch(reject)
            })
        })

        it('should fail if league is full.', () => {
            return new Promise(async function (resolve, reject) {
                const league = await LeagueService.loadLeague(3);
                league.is_closed = false;
                league.max_participants = 2;
                await league.save()
                chai.request(server)
                .post('/league/join')
                .send({ invite_code : league.invite_code })
                .set(TOKEN_HEADER, tokenUserThree)
                .then(res => {
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal(leagueErrors.LEAGUE_FULL)
                    resolve();
                })
                .catch(reject)
            })
        })

        it('should fail if user is suspended from league', () => {
            return new Promise(async function (resolve, reject) {
                const { invite_code } = await LeagueService.loadLeague(3);
                await User.create(users[3])
                await LeagueMember.create({
                    player_id : 3,
                    league_id : 3,
                    is_suspended : true
                });
                chai.request(server)
                .post('/league/join')
                .send({ invite_code })
                .set(TOKEN_HEADER, tokenUserThree)
                .then(res => {
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal(leagueErrors.SUSPENDED_FROM_LEAGUE)
                    resolve();
                })
                .catch(reject)
            })
        })
    })

    describe('GET /league/:leagueId/standing', () => {
        it('should fetch league standings successfully',(done) => {
            chai.request(server)
            .get('/league/3/standing')
            .then(res => {
                expect(res).to.have.status(200);
                const schema = joi.object({
                    id: joi.number().integer().required(),
                    name: joi.string().required(),
                    type: joi.number().integer().valid(LEAGUE_TYPES.general, LEAGUE_TYPES.public, LEAGUE_TYPES.private),
                    starting_gameweek: joi.number().integer().valid(1).required(),
                    administrator_id : joi.number().valid(1).required(),
                    standing : joi.array().items(joi.object({
                        rank : joi.number().integer().positive().required(),
                        previous_rank : joi.number().integer().positive().required(),
                        player_id : joi.number().integer().required(),
                        username : joi.string().alphanum().min(3).max(30).required(),
                        full_name : joi.string().min(5).required(),
                        total_pts : joi.number().integer().positive().allow(null).required(),
                        round_score : joi.number().integer().positive().allow(null).required(),
                        total_exact : joi.number().integer().positive().allow(null).required(),
                        total_close : joi.number().integer().positive().allow(null).required(),
                        total_outcome : joi.number().integer().positive().allow(null).required(),
                    })),
                    next_page : joi.number().integer().allow(null).required(),
                    page : joi.number().integer().positive().required(),
                });

                joi.assert(res.body.data, schema);

                done()
            })
            .catch(done)
        })

        it('should return error if user is trying to fetch invalid page',(done) => {
            chai.request(server)
            .get('/league/3/standing?page=20000')
            .then(res => {
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal(leagueErrors.INVALID_PAGE);
                done()
            })
            .catch(done)
        })
    })

    describe('/league/list/:playerId', () => {
        it('should retrieve list of player\'s leagues successfully', (done) => {
            chai.request(server)
            .get('/league/list/1')
            .then(res => {
                expect(res).to.have.status(200);
                const schema = joi.array().items(joi.object({
                    player_id : joi.number().integer().required(),
                    name: joi.string().required(),
                    player_rank : joi.number().integer().positive().required(),
                    previous_rank : joi.number().integer().positive().required(),
                    league_id : joi.number().integer().positive().required(),
                    type: joi.number().integer().valid(LEAGUE_TYPES.general, LEAGUE_TYPES.public, LEAGUE_TYPES.private),
                    administrator_id : joi.number().required(),
                    invite_code : joi.string().allow(null).required()
                }))

                joi.assert(res.body.data, schema);

                done();
            })
            .catch(done)
        })
    })

    describe('/league/list/:playerId/slim', () => {
        it('should retrieve slim list of player\'s leagues successfully', (done) => {
            chai.request(server)
            .get('/league/list/1/slim')
            .then(res => {
                expect(res).to.have.status(200);
                const schema = joi.array().items(joi.object({
                    id : joi.number().integer().required(),
                    name: joi.string().required(),
                    type: joi.number().integer().valid(LEAGUE_TYPES.general, LEAGUE_TYPES.public, LEAGUE_TYPES.private)
                }))

                joi.assert(res.body.data, schema);

                done();
            })
            .catch(done)
        })
    })

    describe('PUT /league/:leagueId/leave', () => {
        let token = AuthService.generateToken({ id : 1 })
        let tokenUserTwo = AuthService.generateToken({ id : 2 });
        let tokenUserFour = AuthService.generateToken({ id : 4 });
        it('should leave a league successfully', (done) => {
            chai.request(server)
            .put('/league/3/leave')
            .set(TOKEN_HEADER, tokenUserTwo)
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.body.message).to.equal(leagueMessages.LEAGUE_EXIT_SUCCESS)
            })
            .then(async () => {
                const userInLeague = await LeagueMember.findOne({ where : { player_id : 2, league_id : 3}});
                if(userInLeague) throw new Error("User still present in league.")
                done();
            })
            .catch(done)
        })

        it('should fail if user is not a participant', (done) => {
            chai.request(server)
            .put('/league/3/leave')
            .set(TOKEN_HEADER, tokenUserFour)
            .then(res => {
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal(leagueErrors.NOT_A_PARTICIPANT)
                done()
            })
            .catch(done)
        })

        it('should not allow an admin to leave', (done) => {
            chai.request(server)
            .put('/league/3/leave')
            .set(TOKEN_HEADER, token)
            .then(res => {
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal(leagueErrors.ADMIN_NO_LEAVE)
                done()
            })
            .catch(done)
        })
    })

    describe('PUT /league/:leagueId/:playerId', () => {
        let token = AuthService.generateToken({ id : 1 })
        before(async () => {
            await LeagueMember.create({
                player_id : 2,
                league_id : 3
            });
        })


        it('should remove player successfully.', (done) => {
            chai.request(server)
            .put('/league/3/suspend/2')
            .set(TOKEN_HEADER, token)
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.body.message).to.equal(leagueMessages.PLAYER_REMOVE_SUCCESS)
            })
            .then(async () => {
                const userInLeague = await LeagueMember.findOne({ where : { player_id : 2, league_id : 3}});
                if(!userInLeague.is_suspended) throw new Error('User did not get suspended.')
                done();
            })
            .catch(done)
        })

        it('should fail if user does not exist', (done) => {
            chai.request(server)
            .put('/league/3/suspend/567')
            .set(TOKEN_HEADER, token)
            .then(res => {
                expect(res).to.have.status(404)
                done()
            })
            .catch(done)
        })

        it('should fail if player is not in league', (done) => {
            chai.request(server)
            .put('/league/3/suspend/2')
            .set(TOKEN_HEADER, token)
            .then(res => {
                expect(res).to.have.status(404)
                expect(res.body.message).to.equal(leagueErrors.PLAYER_NOT_IN_LEAGUE)
                done()
            })
            .catch(done)
        })
    })

    describe('PUT /league/:leagueId/restore/:playerId', () => {
        let token = AuthService.generateToken({ id : 1 });
        it('should restore player successfully', (done) => {
            chai.request(server)
            .put('/league/3/restore/2')
            .set(TOKEN_HEADER, token)
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.body.message).to.equal(leagueMessages.PLAYER_RESTORE_SUCCESS)
                done()
            })
            .catch(done)
        })
        it('should fail if player is not in suspended league', (done) => {
            chai.request(server)
            .put('/league/3/restore/4')
            .set(TOKEN_HEADER, token)
            .then(res => {
                expect(res).to.have.status(404);
                expect(res.body.message).to.equal(leagueErrors.PLAYER_NOT_IN_SUSPENDED_LIST)
                done()
            })
            .catch(done)
        })
    })

    describe('GET /league/:leagueId/suspended', () => {
        let token = AuthService.generateToken({ id : 1 });
        it('should retrieve list of suspended players.', (done) => {
            chai.request(server)
            .get('/league/3/suspended')
            .set(TOKEN_HEADER, token)
            .then(res => {
                expect(res).to.have.status(200);
                const schema = joi.array().items(joi.object({
                    id: joi.number().integer().required(),
                    username: joi.string().valid(users[3].username).required(),
                    full_name: joi.string().valid(users[3].full_name).required()
                }))
                joi.assert(res.body.data, schema)
                done()
            })
            .catch(done)
        })
    })

    describe('DELETE /league/:leagueId', () => {
        let token = AuthService.generateToken({ id : 1 });
        it('should delete league successfully.', (done) => {
            chai.request(server)
            .delete('/league/3')
            .set(TOKEN_HEADER, token)
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.body.message).to.equal(leagueMessages.LEAGUE_DELETE_SUCCESS);
                done()
            })
            .catch(done)
        })
    })
})