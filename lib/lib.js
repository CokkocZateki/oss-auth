_=lodash;

getSetting = function(setting, defaultValue){
  var settings = Settings.find().fetch()[0];

  if (Meteor.isServer && Meteor.settings && !!Meteor.settings[setting]) { // if on the server, look in Meteor.settings
    return Meteor.settings[setting];

  } else if (Meteor.settings && Meteor.settings.public && !!Meteor.settings.public[setting]) { // look in Meteor.settings.public
    return Meteor.settings.public[setting];

  } else if(settings && (typeof settings[setting] !== 'undefined')) { // look in Settings collection
    return settings[setting];

  } else if (typeof defaultValue !== 'undefined') { // fallback to default
    return  defaultValue;

  } else { // or return undefined
    return undefined;
  }

};

iRound = function(num) {
    var len=(num+'').length;
    var fac=Math.pow(10,len-1);
    return Math.ceil(num/fac)*fac;
}

DNA = function(ship, items) {
  var dna = {};
  _.each(items, function(item) {
    if (item.flag != 5 && item.flag != 155) {
      dna[item.itemType.id] = dna[item.itemType.id]||0;
      dna[item.itemType.id] += (item.quantityDropped||0)+(item.quantityDestroyed||0);
    }
  });
  var t = _.map(dna, function(v,k) { return k+";"+v; });
  var dnastring=t.join(":");
  return ship+":"+dnastring;
} 
    
