const { Agenda }= require('@hokify/agenda');
const config = require('../config/config');
const logger = require('../logger');
const GameweekService = require('../services/gameweek.service');

//function to create an agenda instnace, connect to db and define agenda and start agenda
module.exports.startAgenda = async() => {
    try {
        const agenda = new Agenda({ db: { address: config.mongo.connection_string}});

        //define agenda
        agenda.define('picks reminder', async job => {
            //send reminder
            await GameweekService.callSchedule(job.attrs.data.nextGw);
    
        });
        
        //start agenda
        await agenda.start();
    } catch(error) {
        //Log Agenda error.
        logger.error(
            `Error Connecting to Mongodb and calling schedule. Please try again. 
            Error body : ${JSON.stringify(error.response)}`
        );
    }
};