const { expect } = require('chai');
const chai = require('chai');
const joi = require('joi');

const server = require('../..');
const { TOKEN_HEADER } = require('../../helpers/constants');
const { userMessages } = require('../../helpers/messages');
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
    });

    // describe('PUT /user/updateProfile', () => {
    //     it('should update user profile with data sent by client', (done) => {
    //         let token = AuthService.generateToken({id : 1});
    //         let updatedProfile = {};
    //         updatedProfile.full_name = users[3].full_name;
    //         updatedProfile.username = users[3].username;

    //         console.log(updatedProfile);

    //         chai.request(server)
    //         .put('/user/updateProfile')
    //         .set(TOKEN_HEADER, token)
    //         .send(updatedProfile)
    //         .then(res => {
    //             //console.log(res.body)
    //             expect(res).to.have.status(200);
    //             //console.log(res.body);
    //             const schema = joi.object({
    //                 status: 'success',
    //                 message: joi.string().valid(userMessages.USER_PROFILE_UPDATE_SUCCESS),
    //                 data : null
    //             });

    //             joi.assert(res.body, schema);
    //             done();
    //         })
    //         .catch(done);
    //     })
    // })
})