const joi = require('joi');
const {
    expect
} = require('chai');
const chai = require('chai');
const server = require('../../index');
const {
    TOKEN_HEADER
} = require('../../helpers/constants');
const AuthService = require('../../services/auth.service');
const {
    gameweekMessages
} = require('../../helpers/messages');
const {
    gameweekErrors
} = require('../../errors/index');
const gameweeks = require('../helpers/gameweek.mock');

const {
    GAMEWEEK_CREATED_SUCCESS,
    GAMEWEEK_LOADED_SUCCESS,
    GAMEWEEK_UPDATED_SUCCESS,
    GAMEWEEK_DELETED_SUCCESS,
    GAMEWEEK_STATUS_GET_SUCCESS,
    GAMEWEEK_STATUS_UPDATED_SUCCESS,
    GAMEWEEKS_LOAD_SUCCESS
} = gameweekMessages;

const {
    GAMEWEEK_DEADLINE_ERROR,
    GAMEWEEK_NOT_FOUND,
    GAMEWEEK_TITLE_EXISTS
} =
gameweekErrors;

describe('Gameweek Test  /gameweek', () => {
    describe('POST /gameweek', () => {
        it('it should create a gameweek, if all fields are valid', (done) => {
            const validToken = AuthService.generateToken({ id: 1 });
            chai
                .request(server)
                .post('/gameweek')
                .set(TOKEN_HEADER, validToken)
                .send(gameweeks[1])
                .then((res) => {
                    expect(res).to.have.status(200);
                    const schema = joi.object({
                        status: 'success',
                        message: joi.string().valid(GAMEWEEK_CREATED_SUCCESS),
                        data: joi.object({
                            id: joi.number().integer().required(),
                            deadline: joi.date().valid(new Date(gameweeks[1].deadline)),
                            title: joi.string().valid(gameweeks[1].title),
                            updatedAt: joi.date().required(),
                            createdAt: joi.date().required(),
                        }),
                    });
                    joi.assert(res.body, schema);
                    done();
                })
                .catch(done);
        });

        it('it should return error if gameweek title already exist in the season picked', (done) => {
            const validToken = AuthService.generateToken({ id: 1 });
            const gameweek = { ...gameweeks[1], title: gameweeks[0].title }

            chai.request(server)
            .post('/gameweek')
            .set(TOKEN_HEADER, validToken)
            .send(gameweek)
            .then(res => {
                expect(res).to.have.status(400)

                const schema = joi.object({
                    status: 'error',
                    message: joi.string().valid(GAMEWEEK_TITLE_EXISTS),
                    data: null
                })
                joi.assert(res.body, schema)
                done();
            })
            .catch(done)
        })

        it('It should return an error if the deadline is in the past', (done) => {
            const validToken = AuthService.generateToken({ id: 1 });
            const gameweek = { ...gameweeks[2] }

            chai.request(server)
            .post('/gameweek')
            .set(TOKEN_HEADER, validToken)
            .send(gameweek)
            .then(res => {
                expect(res).to.have.status(400)

                const schema = joi.object({
                    status: 'error',
                    message: joi.string().valid(GAMEWEEK_DEADLINE_ERROR),
                    data: null
                })
                joi.assert(res.body, schema);
                done();
            })
            .catch(done)
        })
    });

    describe('GET /gameweek/:gameweekId', () => {
        it('It should load the requested gameweek if it exists', (done) => {
            const validToken = AuthService.generateToken({ id: 1 });

            chai.request(server)
            .get('/gameweek/1')
            .set(TOKEN_HEADER, validToken)
            .then(res => {
                expect(res).to.have.status(200)
                const schema = joi.object({
                    status: 'success',
                    message: joi.string().valid(GAMEWEEK_LOADED_SUCCESS),
                    data: joi.object({
                        id: joi.number().integer().required(),
                        deadline: joi.date().required(),
                        title: joi.string().valid(gameweeks[0].title)
                    }),
                })

                joi.assert(res.body, schema);
                done();
            })
            .catch(done)
        })

        it('It should return an error if the gameweek does not exists', (done) => {
            const validToken = AuthService.generateToken({ id: 1 });
            chai.request(server)
            .get('/gameweek/4')
            .set(TOKEN_HEADER, validToken)
            .then(res => {
                expect(res).to.have.status(404)
                const schema = joi.object({
                    status: 'error',
                    message: joi.string().valid(GAMEWEEK_NOT_FOUND),
                    data: null
                })

                joi.assert(res.body, schema);
                done()
            })
            .catch(done)
        })
    });

    describe('PUT /gameweek/:gameweekId', () => {
        it('It should update the gameweek if all fields are valid', (done) => {
            const validToken = AuthService.generateToken({ id: 1 })
            const gameweek = { ...gameweeks[0], deadline: "2052-09-05", title: gameweeks[3].title }

            chai.request(server)
            .put('/gameweek/1')
            .set(TOKEN_HEADER, validToken)
            .send(gameweek)
            .then(res => {
                expect(res).to.have.status(200)

                const schema = joi.object({
                    status: 'success',
                    message: joi.string().valid(GAMEWEEK_UPDATED_SUCCESS),
                    data: joi.object({
                        title: joi.string().valid(gameweek.title),
                        deadline: joi.date().valid(new Date(gameweek.deadline)),
                        id: joi.number().integer().required()
                    })
                })

                joi.assert(res.body, schema)
                done();
            })
            .catch(done);
        })

        it('it should return error if gameweek title to be updated already exist in the season picked', (done) => {
            const validToken = AuthService.generateToken({ id: 1 });
            const gameweek = { ...gameweeks[0], title: gameweeks[1].title }

            chai.request(server)
            .put('/gameweek/1')
            .set(TOKEN_HEADER, validToken)
            .send(gameweek)
            .then(res => {
                expect(res).to.have.status(400)

                const schema = joi.object({
                    status: 'error',
                    message: joi.string().valid(GAMEWEEK_TITLE_EXISTS),
                    data: null
                })
                joi.assert(res.body, schema)
                done();
            })
            .catch(done)
        })

        it('It should return an error if the updated deadline is in the past', (done) => {
            const validToken = AuthService.generateToken({ id: 1 });
            const gameweek = { ...gameweeks[0], deadline: gameweeks[2].deadline }

            chai.request(server)
            .put('/gameweek/1')
            .set(TOKEN_HEADER, validToken)
            .send(gameweek)
            .then(res => {
                expect(res).to.have.status(400)

                const schema = joi.object({
                    status: 'error',
                    message: joi.string().valid(GAMEWEEK_DEADLINE_ERROR),
                    data: null
                })
                joi.assert(res.body, schema);
                done();
            })
            .catch(done)
        })
    })

    describe('DELETE /gameweek/:gameweekId', () => {
        it('it should successfully delete the requested gameweek, if the gameweek id is valid', (done) => {
            const validToken = AuthService.generateToken({ id: 1 })

            chai.request(server)
            .delete('/gameweek/2')
            .set(TOKEN_HEADER, validToken)
            .then(res => {
                expect(res).to.have.status(200)

                const schema = joi.object({
                    status: 'success',
                    message: joi.string().valid(GAMEWEEK_DELETED_SUCCESS),
                    data: null
                })

                joi.assert(res.body, schema);
                done()
            })
            .catch(done);
        })

        it('It should return an error if the requested gameweek does not exists', (done) => {
            const validToken = AuthService.generateToken({ id: 1 });
            chai.request(server)
            .delete('/gameweek/4')
            .set(TOKEN_HEADER, validToken)
            .then(res => {
                expect(res).to.have.status(404)
                const schema = joi.object({
                    status: 'error',
                    message: joi.string().valid(GAMEWEEK_NOT_FOUND),
                    data: null
                })

                joi.assert(res.body, schema);
                done()
            })
            .catch(done)
        })
    })

    describe('GET /state', () => {
        it('should fetch gameweek state successfully', (done) => {
            const validToken = AuthService.generateToken({ id: 1 });
            chai
                .request(server)
                .get('/gameweek/state')
                .set(TOKEN_HEADER, validToken)
                .then((res) => {
                    expect(res).to.have.status(200);
                    const schema = joi.object({
                        status: 'success',
                        message: joi.string().valid(GAMEWEEK_STATUS_GET_SUCCESS),
                        data: joi.object({
                            current : joi.object({
                                id : joi.number().integer().positive().required(),
                                title : joi.string().required(),
                                deadline : joi.date().required()
                            }).allow(null).required(),
                            next : joi.object({
                                id : joi.number().integer().positive().required(),
                                title : joi.string().required(),
                                deadline : joi.date().required()
                            }).allow(null).required(),
                            total_players : joi.number().integer().required()
                        }),
                    });
                    joi.assert(res.body, schema);
                    done();
                })
                .catch(done);
        })
    })

    describe('PUT /state', () => {
        it('should update gameweek state successfully', (done) => {
            const validToken = AuthService.generateToken({ id: 1 });
            chai
                .request(server)
                .put('/gameweek/state')
                .set(TOKEN_HEADER, validToken)
                .send({ current : 0, next : 1})
                .then((res) => {
                    expect(res).to.have.status(200);
                    const schema = joi.object({
                        status: 'success',
                        message: joi.string().valid(GAMEWEEK_STATUS_UPDATED_SUCCESS)
                    });
                    joi.assert(res.body, schema);
                    done();
                })
                .catch(done);
        })
        it('should return 422 validation error if one of parameters is not valid', (done) => {
            const validToken = AuthService.generateToken({ id: 1 });
            chai
                .request(server)
                .put('/gameweek/state')
                .set(TOKEN_HEADER, validToken)
                .send({ current : 0, next : "hey"})
                .then((res) => {
                    expect(res).to.have.status(422);
                    const schema = joi.object({
                        status: 'error',
                        message: joi.string().required(),
                        data : null
                    });
                    joi.assert(res.body, schema);
                    done();
                })
                .catch(done);
        })
    })

    describe('GET /gameweek/all', () => {
        it('should get all gameweeks successfully', (done) => {
            chai
                .request(server)
                .get('/gameweek/all')
                .then((res) => {
                    expect(res).to.have.status(200);
                    const schema = joi.object({
                        status: 'success',
                        message: joi.string().valid(GAMEWEEKS_LOAD_SUCCESS),
                        data : joi.array().items({
                            id : joi.number().integer().positive().required(),
                            title : joi.string().required()
                        })
                    });
                    joi.assert(res.body, schema);
                    done();
                })
                .catch(done);
        })
    })
})