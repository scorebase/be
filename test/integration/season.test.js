const { expect } = require('chai');
const chai = require('chai');

const AuthService = require('../../services/auth.service');
const joi = require('joi');
const server = require('../../index');
const { TOKEN_HEADER } = require('../../helpers/constants');
const seasons = require('../helpers/season.mock');
const { seasonErrors } = require('../../errors/index');
const { seasonMessages } = require('../../helpers/messages');

const {
    SEASON_CREATED_SUCCESS,
    SEASON_DELETED_SUCCESS,
    SEASON_UPDATED_SUCCESS,
    SEASON_LOADED_SUCCESS,
} = seasonMessages;

const { SEASON_NAME_EXISTS, SEASON_NOT_FOUND } = seasonErrors;

describe(' Season Test /season', () => {
    describe('POST /season', () => {
        it('It should return success if all fields are valid', (done) => {
            const validToken = AuthService.generateToken({ id: 1 });
            chai
            .request(server)
            .post('/season')
            .set(TOKEN_HEADER, validToken)
            .send(seasons[1])
            .then((res) => {
                expect(res).to.have.status(200);
                const schema = joi.object({
                status: 'success',
                message: joi.string().valid(SEASON_CREATED_SUCCESS),
                data: joi.object({
                    id: joi.number().integer().required(),
                    season_name: joi.string().valid(seasons[1].season_name),
                }),
                });
      
                joi.assert(res.body, schema);
                done();
            })
            .catch(done);
        });
      
        it('It return an error if there occurs a season with similar name', (done) => {
          const validToken = AuthService.generateToken({ id: 1 });
          const newSeason = { ...seasons[1], season_name: seasons[0].season_name };
          chai
            .request(server)
            .post('/season')
            .set(TOKEN_HEADER, validToken)
            .send(newSeason)
            .then((res) => {
              expect(res).to.have.status(400);
              const schema = joi.object({
                status: 'error',
                message: joi.string().valid(SEASON_NAME_EXISTS),
                data: null,
              });
      
              joi.assert(res.body, schema);
              done();
            })
            .catch(done);
        });
      });
      
      describe('GET /season/:seasonId', () => {
        it('It should return successfully loaded season if season id is valid', (done) => {
          const validToken = AuthService.generateToken({ id: 1 });
          chai
            .request(server)
            .get('/season/1')
            .set(TOKEN_HEADER, validToken)
            .then((res) => {
              expect(res).to.have.status(200);
              const schema = joi.object({
                status: 'success',
                message: joi.string().valid(SEASON_LOADED_SUCCESS),
                data: joi.object({
                  id: joi.number().integer(),
                  season_name: joi.string().valid(seasons[0].season_name),
                }),
              });
      
              joi.assert(res.body, schema);
              done();
            })
            .catch(done);
        });
      
        it('It should error if season id does not exist', (done) => {
          const validToken = AuthService.generateToken({ id: 1 });
          chai
            .request(server)
            .get('/season/3')
            .set(TOKEN_HEADER, validToken)
            .then((res) => {
              expect(res).to.have.status(404);
              const schema = joi.object({
                  status: 'error',
                  message: joi.string().valid(SEASON_NOT_FOUND),
                  data: null
              })
      
              joi.assert(res.body, schema)
              done();
            })
            .catch(done);
        });
      });
      
      describe('PUT /season/:seasonId', () => {
          it('it should return successfully updated season if the season id is valid', (done) => {
              const validToken = AuthService.generateToken({ id: 1})
              const updatedSeason = { ...seasons[0], season_name: seasons[2].season_name}
      
              chai.request(server)
              .put('/season/1')
              .set(TOKEN_HEADER, validToken)
              .send(updatedSeason)
              .then(res => {
                  expect(res).to.have.status(200)
      
                  const schema = joi.object({
                      status: 'success',
                      message: joi.string().valid(SEASON_UPDATED_SUCCESS),
                      data: joi.object({
                          id: joi.number().integer().required(),
                          season_name: joi.string().valid(seasons[2].season_name)
                      })
                  })
      
                  joi.assert(res.body, schema)
      
                  done()
              })
              .catch(done)
          })
      
          it('It should error if season id does not exist', (done) => {
              const validToken = AuthService.generateToken({ id: 1 })
              const updatedSeason = { ...seasons[0], season_name: seasons[2].season_name}
      
              chai.request(server)
              .put('/season/4')
              .set(TOKEN_HEADER, validToken)
              .send(updatedSeason)
              .then(res => {
                  expect(res).to.have.status(404)
                  const schema = joi.object({
                      status: 'error',
                      message: joi.string().valid(SEASON_NOT_FOUND),
                      data: null
                  })
      
                  joi.assert(res.body, schema)
      
                  done()
              })
              .catch(done)
          })

          it('It return an error if the updated season name already exists', (done) => {
            const validToken = AuthService.generateToken({ id: 1 });
            const newSeason = { ...seasons[0], season_name: seasons[1].season_name };
            chai
              .request(server)
              .put('/season/1')
              .set(TOKEN_HEADER, validToken)
              .send(newSeason)
              .then((res) => {
                expect(res).to.have.status(400);
                const schema = joi.object({
                  status: 'error',
                  message: joi.string().valid(SEASON_NAME_EXISTS),
                  data: null,
                });
        
                joi.assert(res.body, schema);
                done();
              })
              .catch(done);
          });
      })
      
      describe('DELETE /season/:seasonId', () => {
          it('It should return successfully deleted season if season id is valid', (done) => {
              const validToken = AuthService.generateToken({ id: 1 })
      
              chai.request(server)
              .delete('/season/1')
              .set(TOKEN_HEADER, validToken)
              .then(res => {
                  expect(res).to.have.status(200)
                  const schema = joi.object({
                      status: 'success',
                      message: joi.string().valid(SEASON_DELETED_SUCCESS),
                      data: null
                  })
      
                  joi.assert(res.body, schema)
                  done()
              })
              .catch(done)
          })
      
          it('It should return an error if season id does not exist', (done) => {
              const validToken = AuthService.generateToken({ id: 1 })
      
              chai.request(server)
              .delete('/delete/4')
              .set(TOKEN_HEADER, validToken)
              .then(res => {
                  expect(res).to.have.status(404)
      
                  const schema = joi.object({
                      status: 'error',
                      message: joi.string().valid(SEASON_NOT_FOUND),
                      data: null
                  })
      
                  joi.assert(res.body, schema)
                  done()
              })
              .catch(done)
          })
      })
})
