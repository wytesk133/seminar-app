var Event = require('../models/event');
var Participant = require('../models/participant');

Event.hasMany(Participant, true);
Participant.belongsTo(Event);