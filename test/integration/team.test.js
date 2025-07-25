const { expect } = require('chai');
const chai = require('chai');
const joi = require('joi');
const { TOKEN_HEADER } = require('../../helpers/constants');
const server = require('../../index');
const { teamMessages } = require('../../helpers/messages');
const { teamErrors } = require('../../errors/index');

const teams = require('../helpers/teams.mock');
const AuthService = require('../../services/auth.service');


describe('Teams Test /team', () => {
      describe('POST /team', () => {
        it('It should return team with similar name exists if team with similar name exist', (done) => {
          const validToken = AuthService.generateToken({ id: 1 });
          let team = { ...teams[2], name: teams[0].name };

          chai
            .request(server)
            .post('/team')
            .set(TOKEN_HEADER, validToken)
            .send(team)
            .then((res) => {
              expect(res).to.have.status(400);
              const schema = joi.object({
                status: 'error',
                message: joi.string().valid(teamErrors.TEAM_NAME_EXISTS),
                data: null,
              });
              joi.assert(res.body, schema);
              done();
            })
            .catch(done);
        });

        it('It should return team with similar short name exists if team with similar short name exist', (done) => {
          const validToken = AuthService.generateToken({ id: 1 });
          let team = { ...teams[3], short_name: teams[0].short_name };

          chai
            .request(server)
            .post('/team')
            .set(TOKEN_HEADER, validToken)
            .send(team)
            .then((res) => {
              expect(res).to.have.status(400);

              const schema = joi.object({
                status: 'error',
                message: joi.string().valid(teamErrors.TEAM_SHORTNAME_EXISTS),
                data: null,
              });
              joi.assert(res.body, schema);

              done();
            })
            .catch(done);
        });

        it('It should return team with similar jersey exists if team with similar jersey exist', (done) => {
          const validToken = AuthService.generateToken({ id: 1 });
          let team = { ...teams[4], jersey: teams[0].jersey };
          chai
            .request(server)
            .post('/team')
            .set(TOKEN_HEADER, validToken)
            .send(team)
            .then((res) => {
              expect(res).to.have.status(400);

              const schema = joi.object({
                status: 'error',
                message: joi.string().valid(teamErrors.TEAM_JERSEY_EXISTS),
                data: null,
              });

              joi.assert(res.body, schema);

              done();
            })
            .catch(done);
        });

        it('It should create a team if all fields are valid', (done) => {
          const validToken = AuthService.generateToken({ id: 1 });
          chai
            .request(server)
            .post('/team')
            .set(TOKEN_HEADER, validToken)
            .send(teams[4])
            .then((res) => {
              expect(res).to.have.status(200);
              const schema = joi.object({
                status: 'success',
                message: joi.string().valid(teamMessages.TEAM_CREATED_SUCCESS),
                data: joi.object({
                  id: joi.number().integer().required(),
                  name: joi.string().valid(teams[4].name),
                  short_name: joi.string().valid(teams[4].short_name),
                  jersey: joi.string().valid(teams[4].jersey),
                  updatedAt: joi.date().required(),
                  createdAt: joi.date().required(),
                  color_code : joi.string().required()
                }),
              });
              joi.assert(res.body, schema);
              done();
            })
            .catch(done);
        });
      });

      describe('GET /team/:teamId', () => {
        it('It should return data containing info about the team requested for if the team id is valid', (done) => {
          const validToken  = AuthService.generateToken({ id: 1 });
          chai.request(server)
          .get('/team/1')
          .set(TOKEN_HEADER, validToken)
          .then(res => {
            expect(res).to.have.status(200)
            const schema = joi.object({
              status: 'success',
              message: joi.string().valid(teamMessages.TEAM_FOUND_SUCCESS),
              data: joi.object({
                id: joi.number().integer(),
                name: joi.string().valid(teams[0].name),
                short_name: joi.string().valid(teams[0].short_name),
                jersey: joi.string().valid(teams[0].jersey),
                createdAt: joi.date().required(),
                updatedAt: joi.date().required(),
                color_code : joi.string().required()
              })
            })

            joi.assert(res.body, schema)
            done()
          })
          .catch(done)
        })

        it('It should return an error, if it can not find a team with the id specified', (done) => {
          const validToken = AuthService.generateToken({ id : 1 })
          chai.request(server)
          .get('/team/6')
          .set(TOKEN_HEADER, validToken)
          .then(res => {
            expect(res).to.have.status(404)
            const schema = joi.object({
              status: 'error',
              message: joi.string().valid(teamErrors.TEAM_NOT_FOUND),
              data: null
            })

            joi.assert(res.body, schema)
            done()
          })
          .catch(done)
        })
      })

      describe('PUT /team/:teamId', () => {
        it('It should return the updated team data if all fields are valid', (done) => {
          const validToken = AuthService.generateToken({ id: 1 });
          const teamData = {...teams[0], name: teams[5].name};
          chai.request(server)
          .put('/team/1')
          .set(TOKEN_HEADER, validToken)
          .send(teamData)
          .then(res => {
            expect(res).to.have.status(200)
            const schema = joi.object({
              status: 'success',
              message: joi.string().valid(teamMessages.TEAM_UPDATED_SUCCESS),
              data: joi.object({
                name: joi.string().valid(teams[5].name),
                short_name: joi.string().valid(teams[0].short_name),
                jersey: joi.string().valid(teams[0].jersey),
                id: joi.number().integer().required(),
                color_code : joi.string().required()
              })
            })

            joi.assert(res.body, schema)
            done()
          })
          .catch(done)
        })

        it('It should return an error if the team does not exist', (done) => {
          const validToken = AuthService.generateToken({ id: 1 })
          const teamData = {...teams[0], name: teams[3].name};

          chai.request(server)
          .put('/team/6')
          .set(TOKEN_HEADER, validToken)
          .send(teamData)
          .then(res => {
            expect(res).to.have.status(404)
            const schema = joi.object({
              status: 'error',
              message: joi.string().valid(teamErrors.TEAM_NOT_FOUND),
              data: null
            })

            joi.assert(res.body, schema)
            done()
          })
          .catch(done)
        })

        it('It should return error, if a team with similar short name exists', (done) => {
            const validToken = AuthService.generateToken({ id: 1 });
            let team = { ...teams[0], short_name: teams[1].short_name };

            chai
              .request(server)
              .put('/team/1')
              .set(TOKEN_HEADER, validToken)
              .send(team)
              .then((res) => {
                expect(res).to.have.status(400);

                const schema = joi.object({
                  status: 'error',
                  message: joi.string().valid(teamErrors.TEAM_SHORTNAME_EXISTS),
                  data: null,
                });
                joi.assert(res.body, schema);

                done();
              })
              .catch(done);
          });

          it('It should return error, if a team with similar jersey exists', (done) => {
            const validToken = AuthService.generateToken({ id: 1 });
            let team = { ...teams[0], jersey: teams[1].jersey };
            chai
              .request(server)
              .put('/team/1')
              .set(TOKEN_HEADER, validToken)
              .send(team)
              .then((res) => {
                expect(res).to.have.status(400);

                const schema = joi.object({
                  status: 'error',
                  message: joi.string().valid(teamErrors.TEAM_JERSEY_EXISTS),
                  data: null,
                });

                joi.assert(res.body, schema);

                done();
              })
              .catch(done);
          });

          it('It should return error, if team with similar name exists', (done) => {
            const validToken = AuthService.generateToken({ id: 1 });
            let team = { ...teams[0], name: teams[1].name };

            chai
              .request(server)
              .put('/team/1')
              .set(TOKEN_HEADER, validToken)
              .send(team)
              .then((res) => {
                expect(res).to.have.status(400);
                const schema = joi.object({
                  status: 'error',
                  message: joi.string().valid(teamErrors.TEAM_NAME_EXISTS),
                  data: null,
                });
                joi.assert(res.body, schema);
                done();
              })
              .catch(done);
          });
      })

      describe('DELETE /team/:teamId', () => {
        it('It should delete the team from the DB and return success', (done) => {
          const validToken = AuthService.generateToken({ id: 1 })
          chai.request(server)
          .delete('/team/5')
          .set(TOKEN_HEADER, validToken)
          .then(res => {
            expect(res).to.have.status(200)
            const schema = joi.object({
              status: 'success',
              message: joi.string().valid(teamMessages.TEAM_DELETED_SUCCESS),
              data: null
            })

            joi.assert(res.body, schema)
            done()
          })
          .catch(done)
        })

        it('It should return an error, if it can not find a team with the id specified', (done) => {
            const validToken = AuthService.generateToken({ id : 1 })
            chai.request(server)
            .delete('/team/8')
            .set(TOKEN_HEADER, validToken)
            .then(res => {
              expect(res).to.have.status(404)
              const schema = joi.object({
                status: 'error',
                message: joi.string().valid(teamErrors.TEAM_NOT_FOUND),
                data: null
              })

              joi.assert(res.body, schema)
              done()
            })
            .catch(done)
          })
      })

      describe('GET /team/all', () => {
        it('should get all teams successfully', (done) => {
          chai
              .request(server)
              .get('/team/all')
              .then((res) => {
                  expect(res).to.have.status(200);
                  const schema = joi.object({
                      status: 'success',
                      message: joi.string().valid(teamMessages.TEAM_LIST_LOADED),
                      data : joi.array().items({
                          id : joi.number().integer().positive().required(),
                          name : joi.string().required(),
                          short_name : joi.string().required(),
                          jersey : joi.string().required(),
                          color_code : joi.string().required()
                      })
                  });
                  joi.assert(res.body, schema);
                  done();
              })
              .catch(done);
        })
      })
});
