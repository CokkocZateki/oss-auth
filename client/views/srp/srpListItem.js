Template.srpListItem.helpers({
  statusclass: function() {
    if (this.status=="Open") {
      return "info";
    } else if (this.status=="Declined") {
      return "warning";
    } else if (this.status=="Paid") {
      return "success";
    }
  },
  processable: function() {
    if (Meteor.user().hasRole(["SRP","Director"]) && this.status=="Open") {
      return true;
    } else {
      return false;
    }
  }
});