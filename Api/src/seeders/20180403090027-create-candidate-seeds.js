let faker = require('faker');

module.exports = {
    up: (queryInterface, Sequelize) => {

        return queryInterface.bulkInsert('Candidates', create(), {});

    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Candidates', null, {});
    }
};

let create = () =>{

    let entries = []
    for (let index = 0; index < 10; index++) {

        let random = {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            address1: faker.address.streetAddress(),
            address2: faker.address.secondaryAddress(),
            postcode: faker.address.zipCode(),
            email: faker.internet.email(),
            fullName: faker.name.findName()
        };

        entries.push(random);

    }

    return entries;
};