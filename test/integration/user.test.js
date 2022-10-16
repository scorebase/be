const { expect } = require('chai');
const chai = require('chai');
const joi = require('joi');

const server = require('../..');
const { TOKEN_HEADER } = require('../../helpers/constants');
const AuthService = require('../../services/auth.service');
const users = require('../helpers/users.mock');


describe('USER TESTS', () => {
    describe('GET /user/profile', () => {
        it('should load user profile details', (done) => {
            let token = AuthService.generateToken({ id : 1 });

            chai.request(server)
            .get('/user/profile')
            .set(TOKEN_HEADER, token)
            .then(res => {
                expect(res).to.have.status(200);
                const schema = joi.object({
                    id: joi.number().integer().required(),
                    full_name: users[0].full_name,
                    username: users[0].username,
                    email: users[0].email,
                    updatedAt: joi.date().required(),
                    createdAt: joi.date().required(),
                    email_verified : joi.number().integer().min(0).max(1).required()
                });
                joi.assert(res.body.data, schema);
                done();
            })
            .catch(done)
        })
    })
})