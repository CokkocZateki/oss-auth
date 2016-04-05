Template.intel.rendered = function() {
Session.set("intelFilters", {});
Session.set("intelLoaded", false);
Meteor.subscribe("intel", function onReady() {
  Session.set("intelLoaded", true);
});
}

Template.intel.helpers({
  settings: function() {
    return {
      position: "bottom",
      limit: 20,
      rules: [
        {
          token: '',
          collection: "mapRegions",
          subscription: "mapRegions",
          template: Template.regionSelectTemplate,
          field: "regionName"
        }
      ]
    };
  },
  loadingIntel: function() {
    return !Session.get("intelLoaded");
  },
  intel: function() {
    return Intel.find(Session.get("intelFilters"), {sort: {killTime:-1}});
  }
});



Template.intel.events({
  "autocompleteselect #area": function(event, template, doc) {
    console.log(doc, doc.regionID);
    Session.set("intelFilters", {regionID: doc.regionID});
    Session.set("intelLoaded", false);
    Meteor.subscribe("intel", doc.regionID, function onReady() {
      Session.set("intelLoaded", true);
    });
  }  
});