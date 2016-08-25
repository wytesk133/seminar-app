var Event = require('../models/event');
var Participant = require('../models/participant');
var WordCloudQ = require('../models/wordCloudQ');
var WordCloudA = require('../models/wordCloudA');

Event.hasMany(Participant, true);
Participant.belongsTo(Event);

Event.hasMany(WordCloudQ, true);
WordCloudQ.belongsTo(Event);

WordCloudQ.hasMany(WordCloudA, true);
WordCloudA.belongsTo(WordCloudQ);

Participant.hasMany(WordCloudA, true);
WordCloudA.belongsTo(Participant);
