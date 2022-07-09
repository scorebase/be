const { expect } = require("chai");
const jwt = require("jsonwebtoken");
const { authErrors } = require("../../errors");
const { UnauthorizedError } = require("../../errors/http_errors");
const { TOKEN_HEADER } = require("../../helpers/constants");
const AuthMiddleware = require("../../middlewares/auth.middleware");
const AuthService = require("../../services/auth.service");

const user_id = 1;
const random_secret = "random_secret"

let valid_token = AuthService.generateToken({ id : user_id });
let invalid_token = jwt.sign({id : 1}, random_secret);

let mock_express_response = {};
let mock_express_request = {
    headers : {}
};

let mock_fn_called = false;
let mock_next_function = () => {
    mock_fn_called = true;
    return;
};

describe('AuthMiddleware', () => {

    describe('AuthMiddleware.isLogedIn', () => {
        beforeEach(() => {
            delete mock_express_request.headers[TOKEN_HEADER];
            mock_fn_called = false;
        });

        it('should move to next route if token is valid', (done) => {
            mock_express_request.headers[TOKEN_HEADER] = valid_token;
            try {
                AuthMiddleware.isLoggedIn(mock_express_request, mock_express_response, mock_next_function);
                expect(mock_fn_called).to.be.true;
                expect(mock_express_request).to.have.property('userId')
                expect(mock_express_request.userId).to.equal(user_id);
                done();
            } catch (error) {
                done(error);
            }
        })

        it('should throw UnauthorizedError if token is not provided', (done) => {
            try {
                AuthMiddleware.isLoggedIn(mock_express_request, mock_express_response, mock_next_function);
                expect(mock_fn_called).to.be.false;
                expect(mock_express_request).to.not.have.property('userId');
                done();
            } catch (error) {
                expect(error).to.be.instanceof(UnauthorizedError);
                expect(error.message).to.equal(authErrors.TOKEN_REQUIRED);
                done();
            }
        })

        it('should throw UnauthorizedError if token is invalid', (done) => {
            mock_express_request.headers[TOKEN_HEADER] = invalid_token;
            try {
                AuthMiddleware.isLoggedIn(mock_express_request, mock_express_response, mock_next_function);
                expect(mock_fn_called).to.be.false;
                expect(mock_express_request).to.not.have.property('userId');
                done();
            } catch (error) {
                expect(error).to.be.instanceof(UnauthorizedError);
                expect(error.message).to.equal(authErrors.INVALID_SESSION);
                done();
            }
        })
    })
})