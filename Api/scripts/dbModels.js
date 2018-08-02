let shell = require('shelljs');

let sequelize = '../node_modules/.bin/sequelize';

// possible commands
let modelGenerate = 'model:generate --name';

let attributes = '--attributes';

let name;
name = 'Competitions';
let attributeOptions;
attributeOptions = 'Title:string,MagazineID:integer,Issue:integer,Description:text,StartDate:date,ExpiryDate:date';

shell.cd('src');
shell.exec(
    sequelize + ' ' + modelGenerate + ' ' + name + ' ' + attributes + ' ' + attributeOptions
);