const chai = require('chai');
const chaiHttp = require('chai-http');
const joi = require('joi');
const server = require('../..');

chai.use(chaiHttp);

describe("/ test", () => {
    it('should return valid data for base path', () => {
        chai.request(server)
        .get('/')
        .end((err, res) => {
            const schema = joi.object({
                status : joi.string().required().equal('success'),
                data : joi.object({
                    name : joi.string().required().equal('scorebase')
                })
            });
    
            joi.assert(res.body, schema);
        })
    });
});


