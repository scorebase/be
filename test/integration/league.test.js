const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const joi = require('joi');
const { TOKEN_HEADER, LEAGUE_TYPES } = require('../../helpers/constants');
const AuthService = require('../../services/auth.service');
const leaguesMock = require('../helpers/leagues.mock');
const server = require('../..');

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
                createdAt: joi.date().required()
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