const {expect} = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const joi = require('joi');

const server = require('../..');
const sequelize = require('../../config/db');
const { TOKEN_HEADER } = require('../../helpers/constants');
const { picksErrors, userErrors, gameweekErrors } = require('../../errors');
const { picksMessages } = require('../../helpers/messages');
const AuthService = require('../../services/auth.service');

const Fixture = require('../../models/fixture.model');

const fixtures = require('../helpers/fixtures.mock');
const picks = require('../helpers/picks.mock');

before(async () => {
    await Fixture.create(fixtures[1]);
});

describe('POST /picks/:gameweekId', () => {
    it('It should return 400 with response Master pick cannot be less than one', 
    (done) => {
        let token = AuthService.generateToken({ id : 1 });

        chai.request(server)
        .post('/picks/1')
        .set(TOKEN_HEADER, token)
        .send(picks[1])
        .then(res => {
            expect(res).to.have.status(400);
            const schema = joi.object({
                status: 'error',
                message: joi.string().valid(picksErrors.MASTER_PICK_LESS_THAN_ONE),
                data: null
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done);
    });

    it('It should return 400 with response Master pick cannot be greater than one', 
    (done) => {
        let token = AuthService.generateToken({ id : 1 });

        chai.request(server)
        .post('/picks/1')
        .set(TOKEN_HEADER, token)
        .send(picks[2])
        .then(res => {
            expect(res).to.have.status(400);
            const schema = joi.object({
                status: 'error',
                message: joi.string().valid(picksErrors.MASTER_PICK_GREATER_THAN_ONE),
                data: null
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done);
    });

    it('It should create a pick by gameweekId if all fields are valid', 
    (done) => {
        let token = AuthService.generateToken({ id : 1 });

        chai.request(server)
        .post('/picks/1')
        .set(TOKEN_HEADER, token)
        .send(picks[0])
        .then(res => {
            expect(res).to.have.status(200);
            const schema = joi.object({
                status: 'success',
                message: joi.string().valid(picksMessages.PICK_CREATE_SUCCESS),
                data: joi.object({
                    id: joi.number().integer().required(),
                    player_id: joi.number().integer().required(),
                    gameweek_id: joi.number().integer().required(),
                    total_points: joi.number().integer().required(),
                    updatedAt: joi.date().required(),
                    createdAt: joi.date().required(),
                    pick_items: joi.array().items({
                        id: joi.number().integer().required(),
                        fixture_id: joi.number().integer().required(),
                        home_pick: joi.number().integer().required(),
                        away_pick: joi.number().integer().required(),
                        points: joi.number().integer().required(),
                        is_master_pick: joi.bool().required(),
                        picks_id: joi.number().integer().required(),
                        updatedAt: joi.date().required(),
                        createdAt: joi.date().required()
                    })
                })
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done);
    });

    it('It should return 404 with response gameweek not found', (done) => {
        let token = AuthService.generateToken({ id : 1 });

        chai.request(server)
        .post('/picks/1000000')
        .set(TOKEN_HEADER, token)
        .send(picks[0])
        .then(res => {
            expect(res).to.have.status(404);
            const schema = joi.object({
                status: 'error',
                message: joi.string().valid(gameweekErrors.GAMEWEEK_NOT_FOUND),
                data: null
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done);
    });

    it('It should return 400 with response pick already exists', (done) => {
        let token = AuthService.generateToken({ id : 1 });

        chai.request(server)
        .post('/picks/1')
        .set(TOKEN_HEADER, token)
        .send(picks[0])
        .then(res => {
            expect(res).to.have.status(400);
            const schema = joi.object({
                status: 'error',
                message: joi.string().valid(picksErrors.PICK_ALREADY_EXISTS),
                data: null
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done);
    });
});

describe('PUT /picks/:id', () => {
    it('It should update a pick if all fields are valid', (done) => {
        let token = AuthService.generateToken({ id : 1 });

        chai.request(server)
        .put('/picks/1')
        .set(TOKEN_HEADER, token)
        .send(picks[3])
        .then(res => {
            expect(res).to.have.status(200);
            const schema = joi.object({
                status: 'success',
                message: joi.string().valid(picksMessages.PICK_UPDATE_SUCCESS),
                data: joi.object({
                    player_id: joi.number().integer().required(),
                    gameweek_id: joi.number().integer().required(),
                    total_points: joi.number().integer().required(),
                    pick_items: joi.array().items({
                        fixture_id: joi.number().integer().required(),
                        home_pick: joi.number().integer().required(),
                        away_pick: joi.number().integer().required(),
                        points: joi.number().integer().required(),
                        is_master_pick: joi.bool().required()
                    })
                })
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done);
    });

    it('It should return 404 with response Pick not found', (done) => {
        let token = AuthService.generateToken({ id : 1 });

        chai.request(server)
        .put('/picks/1000000')
        .set(TOKEN_HEADER, token)
        .send(picks[3])
        .then(res => {
            expect(res).to.have.status(404);
            const schema = joi.object({
                status: 'error',
                message: joi.string().valid(picksErrors.PICK_NOT_FOUND),
                data: null
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done);
    });

    it('It should return 400 with response Master pick cannot be less than one', 
    (done) => {
        let token = AuthService.generateToken({ id : 1 });

        chai.request(server)
        .put('/picks/1')
        .set(TOKEN_HEADER, token)
        .send(picks[4])
        .then(res => {
            expect(res).to.have.status(400);
            const schema = joi.object({
                status: 'error',
                message: joi.string().valid(picksErrors.MASTER_PICK_LESS_THAN_ONE),
                data: null
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done);
    });

    it('It should return 400 with response Master pick cannot be greater than one', 
    (done) => {
        let token = AuthService.generateToken({ id : 1 });

        chai.request(server)
        .put('/picks/1')
        .set(TOKEN_HEADER, token)
        .send(picks[5])
        .then(res => {
            expect(res).to.have.status(400);
            const schema = joi.object({
                status: 'error',
                message: joi.string().valid(picksErrors.MASTER_PICK_GREATER_THAN_ONE),
                data: null
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done);
    });
});

describe('GET /picks/:playerId/:gameweekId', () => {
    it('It should return a pick by playerId and gameweekId', 
    (done) => {
        let token = AuthService.generateToken({ id : 1 });

        chai.request(server)
        .get('/picks/1/1')
        .set(TOKEN_HEADER, token)
        .then(res => {
            expect(res).to.have.status(200);
            const schema = joi.object({
                status: 'success',
                message: joi.string().valid(picksMessages.PICK_FOUND_SUCCESS),
                data: joi.object({
                    id: joi.number().integer().required(),
                    player_id: joi.number().integer().required(),
                    gameweek_id: joi.number().integer().required(),
                    total_points: joi.number().integer().required(),
                    updatedAt: joi.date().required(),
                    createdAt: joi.date().required(),
                    pick_items: joi.array().items({
                        id: joi.number().integer().required(),
                        fixture_id: joi.number().integer().required(),
                        home_pick: joi.number().integer().required(),
                        away_pick: joi.number().integer().required(),
                        points: joi.number().integer().required(),
                        is_master_pick: joi.bool().required(),
                        picks_id: joi.number().integer().required(),
                        updatedAt: joi.date().required(),
                        createdAt: joi.date().required()
                    })
                })
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done);
    });

    it('It should return 404 with response User not found', (done) => {
        let token = AuthService.generateToken({ id : 1 });

        chai.request(server)
        .get('/picks/1000000/1')
        .set(TOKEN_HEADER, token)
        .then(res => {
            expect(res).to.have.status(404);
            const schema = joi.object({
                status: 'error',
                message: joi.string().valid(userErrors.USER_NOT_FOUND),
                data: null
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done);
    });

    it('It should return 404 with response gameweek not found', (done) => {
        let token = AuthService.generateToken({ id : 1 });

        chai.request(server)
        .get('/picks/1/1000000')
        .set(TOKEN_HEADER, token)
        .then(res => {
            expect(res).to.have.status(404);
            const schema = joi.object({
                status: 'error',
                message: joi.string().valid(gameweekErrors.GAMEWEEK_NOT_FOUND),
                data: null
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done);
    });
});

describe('DELETE /picks/:id', () => {
    it('It should delete a pick', (done) => {
        let token = AuthService.generateToken({ id : 1 });

        chai.request(server)
        .delete('/picks/1')
        .set(TOKEN_HEADER, token)
        .then(res => {
            expect(res).to.have.status(200);
            const schema = joi.object({
                status: 'success',
                message: joi.string().valid(picksMessages.PICK_DELETED_SUCCESS),
                data: null
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done);
    });

    it('It should return 404 with response Pick not found', (done) => {
        let token = AuthService.generateToken({ id : 1 });

        chai.request(server)
        .delete('/picks/1000000')
        .set(TOKEN_HEADER, token)
        .then(res => {
            expect(res).to.have.status(404);
            const schema = joi.object({
                status: 'error',
                message: joi.string().valid(picksErrors.PICK_NOT_FOUND),
                data: null
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done);
    });
});