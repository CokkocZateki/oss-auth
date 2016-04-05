/*Template._loginButtons.rendered = function() {
  $('.dropdown-toggle').dropdown();
}

Template._loginButtonsLoggedOut.rendered =function(){
  $('.dropdown-toggle').dropdown();
  
};

Template._loginButtons.events({
  'click .dropdown-toggle': function (e) {
    e.preventDefault();
    Template._loginButtons.toggleDropdown();
    }
});
*/
Template.nav.rendered = function() {
  $('.dropdown-toggle').dropdown();
}

Template.nav.helpers({
  isAdmin: function() {
    if (Meteor.user().hasRole(["Admin", "Director"])) {
      return true;
    } else {
      return false;
    }
  },
  isMember: function() {
    if (Meteor.user().hasRole(["Member"])) {
      return true;
    } else {
      return false;
    }   
  }
});