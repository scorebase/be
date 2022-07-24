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
const League = require('../../models/league.model');
const LeagueMember = require('../../models/league_member.model');
const users = require('../helpers/users.mock');

chai.use(chaiHttp);

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
    
        it('should open league to new entries successfully', (done) => {
            let newUpdates = { ...leagueUpdates, is_closed : false };
            chai.request(server)
            .put('/league/1')
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
        it('should successfully update a league code.', () => {
            return new Promise(async function (resolve, reject) {
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
                .catch(reject)
            })
        })
    })
    
    describe('PUT /league/join', () => {
        let token = AuthService.generateToken({ id : 1 });
        let tokenUserTwo = AuthService.generateToken({ id : 2 });
        let tokenUserThree = AuthService.generateToken({ id : 3 });
        let tokenUserFour = AuthService.generateToken({ id : 4 });
        it('join league successfully.', () => {
            return new Promise(async function (resolve, reject) {
                const { invite_code } = await League.findByPk(1);
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
                const { invite_code } = await League.findByPk(1);
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
                const league = await LeagueService.loadLeague(1);
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
                const league = await LeagueService.loadLeague(1);
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
                const { invite_code } = await LeagueService.loadLeague(1);
                await LeagueMember.create({
                    player_id : 4,
                    league_id : 1,
                    is_suspended : true
                });
                chai.request(server)
                .post('/league/join')
                .send({ invite_code })
                .set(TOKEN_HEADER, tokenUserFour)
                .then(res => {
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal(leagueErrors.SUSPENDED_FROM_LEAGUE)
                    resolve();
                })
                .catch(reject)
            })
        })
    })
    
    describe('PUT /league/:leagueId/leave', () => {
        let token = AuthService.generateToken({ id : 1 })
        let tokenUserTwo = AuthService.generateToken({ id : 2 });
        let tokenUserThree = AuthService.generateToken({ id : 3 });
        it('should leave a league successfully', (done) => {
            chai.request(server)
            .put('/league/1/leave')
            .set(TOKEN_HEADER, tokenUserTwo)
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.body.message).to.equal(leagueMessages.LEAGUE_EXIT_SUCCESS)
            })
            .then(async () => {
                const userInLeague = await LeagueMember.findOne({ where : { player_id : 2, league_id : 1}});
                if(userInLeague) throw new Error("User still present in league.")
                done();
            })
            .catch(done)
        })
    
        it('should fail if user is not a participant', (done) => {
            chai.request(server)
            .put('/league/1/leave')
            .set(TOKEN_HEADER, tokenUserThree)
            .then(res => {
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal(leagueErrors.NOT_A_PARTICIPANT)
                done()
            })
            .catch(done)
        })
    
        it('should not allow an admin to leave', (done) => {
            chai.request(server)
            .put('/league/1/leave')
            .set(TOKEN_HEADER, token)
            .then(res => {
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal(leagueErrors.ADMIN_NO_LEAVE)
                done()
            })
            .catch(done)
        })
    })
    describe('PUT /league/:leagueId/suspend?username={username}', () => {
        let token = AuthService.generateToken({ id : 1 })
        before(async () => {
            await LeagueMember.create({
                player_id : 2,
                league_id : 1
            });
        })
        
    
        it('should remove player successfully.', (done) => {
            chai.request(server)
            .put('/league/1/suspend?username=usernameTwo')
            .set(TOKEN_HEADER, token)
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.body.message).to.equal(leagueMessages.PLAYER_REMOVE_SUCCESS)
            })
            .then(async () => {
                const userInLeague = await LeagueMember.findOne({ where : { player_id : 2, league_id : 1}});
                if(!userInLeague.is_suspended) throw new Error('User did not get suspemded.')
                done();
            })
            .catch(done)
        })
    
        it('should fail if username does not exist', (done) => {
            chai.request(server)
            .put('/league/1/suspend?username=usernam')
            .set(TOKEN_HEADER, token)
            .then(res => {
                expect(res).to.have.status(404)
                done()
            })
            .catch(done)
        })
    
        it('should fail if player with username is not in league', (done) => {
            chai.request(server)
            .put('/league/1/suspend?username=usernameTwo')
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
            .put('/league/1/restore/4')
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
            .put('/league/1/restore/4')
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
            .get('/league/1/suspended')
            .set(TOKEN_HEADER, token)
            .then(res => {
                expect(res).to.have.status(200);
                const schema = joi.array().items(joi.object({
                    id: joi.number().integer().required(),
                    username: joi.string().valid(users[1].username).required(),
                    full_name: joi.string().valid(users[1].fullName).required()
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
            .delete('/league/1')
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