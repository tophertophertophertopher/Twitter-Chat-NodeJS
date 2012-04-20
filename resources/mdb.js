/**
 * @author topherbullock
 */
var mongoose =  require('mongoose');

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

mongoose.connect('mongodb://localhost/test');

var Message = new Schema({
 username     : String
  , body      : String 
  , date      : {type: Date, default: Date.now}
});

mongoose.model('Message', Message);

var MsgModel = mongoose.model('Message');

module.exports = { "mongoose": mongoose, "models": { "message": MsgModel } };


