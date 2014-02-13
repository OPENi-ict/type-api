/*
 * openi_data_api
 * openi-ict.eu
 *
 * Copyright (c) 2013 dmccarthy
 * Licensed under the MIT license.
 */

'use strict';

var openiLogger  = require('openi-logger')
var openiUtils   = require('openi-cloudlet-utils')


var init = function(logger_params){
   this.logger = openiLogger(logger_params);
}


var getType = function (path) {

   var parts   = path.split('/')
   var namePos = 4;

   return parts[namePos]

}


var genPostMessage = function(msg){

   var typeId = openiUtils.hash(msg.json)

   return {
      'dao_actions'      : [
         { 'action' : 'POST', 'database': 'types', 'object_name'  : typeId, 'object_data'  : msg.json }
      ],
      'mongrel_resp' : {'value':true, data : {type_id : typeId} },
      'clients'      : [
         {'uuid' : msg.uuid, 'connId' : msg.connId }
      ]
   }
}


var genGetMessage = function(msg){

   var type =  getType(msg.path)

   console.log(type)

   return {
      'dao_actions'      : [
         { 'action' : 'GET', 'database': 'types', 'object_name'  : type }
      ],
      'mongrel_resp' : { 'value':true },
      'clients'      : [
         {'uuid' : msg.uuid, 'connId' : msg.connId }
      ]
   }
}


var genPatchMessage = function(msg){

   var actions = []

   for ( var i =0; i < msg.json.length; i++){
      var entry  = msg.json[i]
      var typeId = openiUtils.hash(entry)
      actions[i]  = { 'action' : 'POST', 'database': 'types', 'object_name' : typeId, 'object_data'  : entry }
   }

   return {
      'dao_actions'  : actions,
      'mongrel_resp' : {'value':true },
      'clients'      : [
         {'uuid' : msg.uuid, 'connId' : msg.connId }
      ]
   }
}


var processMongrel2Message = function (msg) {

   this.logger.logMongrel2Message(msg)

   var dao_msg = null;

   switch(msg.headers['METHOD']){
   case 'POST':
      dao_msg = genPostMessage(msg)
      break;
   case 'GET':
      dao_msg = genGetMessage(msg)
      break;
   case 'PATCH':
      dao_msg = genPatchMessage(msg)
      break;
   default:
      break;
   }

   this.logger.log('debug', dao_msg)

   return dao_msg
}


module.exports.init                   = init
module.exports.getObject              = getType
module.exports.processMongrel2Message = processMongrel2Message