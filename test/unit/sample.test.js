const joi = require('joi');

const sum = (a, b) => {
    return a + b
}

describe("Sample test", () => {
    it('sum function should work', () => {
        const mySum = sum(2,5);
        const schema = joi.number().equal(7);

        joi.assert(mySum, schema);
    });
})