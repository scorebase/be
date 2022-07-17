const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const joi = require('joi');

const server = require('../..');
const sequelize = require('../../config/db');
const { authErrors } = require('../../errors');
const { TOKEN_HEADER } = require('../../helpers/constants');
const { authMessages } = require('../../helpers/messages');
const User = require('../../models/user.model');
const AuthService = require('../../services/auth.service');
const users = require('../helpers/users.mock');

chai.use(chaiHttp);


before(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', {raw: true}) //a hack for now
    await sequelize.sync({ force : true });
    await User.create(users[0]);
});

describe('POST /auth/register', () => {

    it('should register a user if all fields are valid', (done) => {
        chai.request(server)
        .post('/auth/register')
        .send(users[1])
        .then(res => {
            expect(res).to.have.status(200);
            const schema = joi.object({
                token: joi.string().regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/),
                user : joi.object({
                    id: joi.number().integer().required(),
                    full_name: users[1].fullName,
                    username: users[1].username,
                    email: users[1].email,
                    updatedAt: joi.date().required(),
                    createdAt: joi.date().required(),
                    email_verified : joi.bool().required()
                })   
            });
            joi.assert(res.body.data, schema);
            done();
        })
        .catch(done)
    })

    it('should return email exists error if email already exists', (done) => {
        let user = { ...users[2], email : users[0].email };
        chai.request(server)
        .post('/auth/register')
        .send(user)
        .then(res => {
            expect(res).to.have.status(400);
            const schema = joi.object({
                status : 'error',
                data : null,
                message : joi.string().valid(authErrors.EMAIL_EXISTS_ERROR)
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done)
    })

    it('should return username exists error if username already exists', (done) => {
        let user = { ...users[2], username : users[0].username };
        chai.request(server)
        .post('/auth/register')
        .send(user)
        .then(res => {
            expect(res).to.have.status(400);
            const schema = joi.object({
                status : 'error',
                data : null,
                message : joi.string().valid(authErrors.USERNAME_EXISTS_ERROR)
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done)
    })

    it('should return validation error if invalid email is passed', (done) => {
        let user = { ...users[2], email : 'fake@email' };
        chai.request(server)
        .post('/auth/register')
        .send(user)
        .then(res => {
            expect(res).to.have.status(422);
            const schema = joi.object({
                status : 'error',
                data : null,
                message : joi.string().required()
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done)
    })

})


describe('POST /auth/login', () => {
    it('should login with username if username and password are correct', (done) => {
        chai.request(server)
        .post('/auth/login')
        .send({ user : users[0].username, password : users[0].password})
        .then(res => {
            expect(res).to.have.status(200);
            const schema = joi.object({
                token: joi.string().regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/),
                user : joi.object({
                    id: joi.number().integer().required(),
                    full_name: users[0].full_name,
                    username: users[0].username,
                    email: users[0].email,
                    updatedAt: joi.date().required(),
                    createdAt: joi.date().required(),
                    email_verified : joi.bool().required()
                })   
            });
            joi.assert(res.body.data, schema);
            done();
        })
        .catch(done)
    })

    it('should login with email if email and password are correct', (done) => {
        chai.request(server)
        .post('/auth/login')
        .send({ user : users[0].email, password : users[0].password})
        .then(res => {
            expect(res).to.have.status(200);
            const schema = joi.object({
                token: joi.string().regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/),
                user : joi.object({
                    id: joi.number().integer().required(),
                    full_name: users[0].full_name,
                    username: users[0].username,
                    email: users[0].email,
                    updatedAt: joi.date().required(),
                    createdAt: joi.date().required(),
                    email_verified : joi.bool().required()
                })   
            });
            joi.assert(res.body.data, schema);
            done();
        })
        .catch(done)
    })

    it('should return invalid credentials if password is not correct', (done) => {
        chai.request(server)
        .post('/auth/login')
        .send({ user : users[0].email, password : users[1].password})
        .then(res => {
            expect(res).to.have.status(401);
            const schema = joi.object({
                status : 'error',
                data : null,
                message : joi.string().valid(authErrors.INVALID_CREDENTIALS_ERROR).required()
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done)
    })

    it('should return 404 account not found if username/email does not exist', (done) => {
        chai.request(server)
        .post('/auth/login')
        .send({ user : users[2].email, password : users[1].password})
        .then(res => {
            expect(res).to.have.status(404);
            const schema = joi.object({
                status : 'error',
                data : null,
                message : joi.string().valid(authErrors.INVALID_CREDENTIALS_ERROR).required()
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done)
    })
})


describe('PUT /auth/password', () => {
    const valid_token = AuthService.generateToken({ id : 1 });
    it('should update password if old password is correct and new password is valid', (done) => {
        chai.request(server)
        .put('/auth/password')
        .set(TOKEN_HEADER, valid_token)
        .send({ oldPassword : users[0].password, newPassword : users[1].password})
        .then(res => {
            expect(res).to.have.status(200);
            const schema = joi.object({
                status : 'success',
                data : null,
                message : joi.string().valid(authMessages.PASSWORD_UPDATE_SUCCESS).required()
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done)
    })

    it('should return validation error if old password is equal to new password', (done) => {
        chai.request(server)
        .put('/auth/password')
        .set(TOKEN_HEADER, valid_token)
        .send({ oldPassword : users[0].password, newPassword : users[0].password})
        .then(res => {
            expect(res).to.have.status(422);
            const schema = joi.object({
                status : 'error',
                data : null,
                message : joi.string().required()
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done)
    })
})
