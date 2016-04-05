Meteor.publish("intel", function(region) {
  var self = this;
  //https://beta.eve-kill.net/api/kills/shipTypeID/671/regionID/10000041/
  /*
    erebus: 671
    leviathan: 3764
    avatar: 11567
    ragnarok: 23773
    revenant: 3514
    nyx: 23913
    wyvern: 23917
    aeon: 23919
    hel: 22852
    
    regions:
      syndicate: 10000041
  */
  var url = "https://beta.eve-kill.net/api/kills/"  //shipTypeID/671/regionID/10000041/
  var shipTypes = [
    671,
    3764,
    11567,
    23773,
    3514,
    23913,
    23917,
    23919,
    22852
  ];
  region=region||10000041;
  var results=[];
  _.each(shipTypes, function(shipTypeID) {
    try {
      var res=HTTP.get(url+"shipTypeID/"+shipTypeID+"/regionID/"+region+"/startTime/"+moment().subtract(14, 'days').format("YYYYMMDDHHmm")+"/orderDirection/desc/");
      console.log(Meteor.users.findOne(self.userId).username, "requested typeID",shipTypeID,"for region",region,"got",res.data.length,"results");
      results=results.concat(res.data);
    } catch (e) {
      console.log("error", e);
    }
  });
  results=_.uniq(results);
  _.each(results, function(result) {
    var victimShip=invTypes.findOne({typeID: result.victim.shipTypeID.toString()});
    var system=mapSolarSystems.findOne({solarSystemID: result.solarSystemID.toString()});
    result.zkb=result.zkb||{};
    var killers=[];
    _.each(result.attackers, function(attacker) {
      var aship=invTypes.findOne({typeID: attacker.shipTypeID.toString()})||{};
      killers.push(attacker.characterName+" ("+(aship.typeName||"unknown Ship")+") ["+attacker.corporationName+"@"+attacker.allianceName+"] "+attacker.damageDone+(attacker.finalBlow?" FINALBLOW":""));
    });
    var doc={
      killID: result.killID,
      killTime: result.killTime,
      solarSystem: system,
      regionID: system.regionID,
      victimName: result.victim.characterName+" ["+result.victim.corporationName+"@"+result.victim.allianceName+"]",
      victimShip: victimShip.typeName,
      damage: result.victim.damageTaken,
      attackers: killers,
      totalValue: result.zkb.totalValue,
      source: result.zkb.source
    }
    
    self.added('intel', Random.id(), doc);
  });
  self.ready();
});