Template.srp.events({
  'click #requestSRP': function (e) {
    $('#requestSRPModal').modal("show");
  },
  'click #processSRP': function(e) {
    Meteor.call("nextSRP", function(err, res) {
      if (err) {
        Messenger().post({
          type:"error",
          message: err   
        });   
      } else if (res.next) {
        Messenger().post({
          type:"info", 
          message:"Found open SRP",
          actions: {
            process: {
              label: "Process",
              action: function() {
                Router.go(res.next);
              }
            }
          }
        });
        //Router.go(res.next);
      } else {
        Messenger().post({
          type:"error",
          message: "No open SRP requests"
        });
      }

      /*if (err) {
        alert(JSON.stringify(err));
      } else {
        if (res.next) {
          Router.go(res.next);
        } else {
          alert("No open requests");
        }
      }*/
    
    });
  },
/*  'click #updatePrices': function(e) {
    alert("TOLD YOU NOT TO CLICK IT! - HAL9000 will update all prices, expect a slow server!");
    Meteor.call("updatePrices", function(err, res) {
      alert("updatePrices result:"+(res||err.message));
    });

  }*/
  'click #prevMonth': function() {
    var special=Session.get("special")||moment();
    special=moment(special);
    special=special.subtract(1, 'months');
    Session.set("special", special.toDate());
    Template.srp.getSRPStats();  
    return;
  }, 
  'click #nextMonth': function() {
    var special=Session.get("special")||moment();
    special=moment(special); 
    if (special.startOf('month')!=moment().startOf('month')) {
      special=special.add(1, 'months');
    }
    Session.set("special", special.toDate());
    Template.srp.getSRPStats();  
    return;
  }
});

var ERRORS_KEY = 'srpErrors';

Template.srp.created = function() {
  Session.set(ERRORS_KEY, {});
};

Template.srp.handle = Meteor.subscribeWithPagination('reimbursements', 20);

Template.srp.srps = Reimbursements.find({}, {sort: {killID: -1}});

Template.srp.srps.observeChanges({
  changed: function(id, fields) {
    Meteor.call("getSRPStats", function (err, res) {
      Session.set('SRPStats', res);
    });
  }
});

Template.srp.getSRPStats = function() {
  var special=Session.get("special")||null;
  Meteor.call("getSRPStats", special, function (err, res) {
    Session.set('SRPStats', res);
  });
}

Template.srp.rendered = function() {
  Template.srp.getSRPStats();
  $(window).scroll(function() {
    if($(window).scrollTop() + $(window).height() > $(document).height() - 100 && Template.srp.handle.ready()) {
      Template.srp.handle.loadNextPage();
    }
  });
}

Template.srp.helpers({
  loading: function() {
    return !Template.srp.handle.ready();
  },
  statsLoaded: function() {
    return _.isArray(Session.get('SRPStats'));
  },
  stats: function() {
    return (Session.get('SRPStats')||[]);
  },
  statsSum: function() {
    return (Session.get('SRPStats').reduce(function(pv, cv) { return pv+cv.total; }, 0)||[]);
  },
  statsCount: function() {
    return (Session.get('SRPStats').reduce(function(pv, cv) { return pv+cv.count; }, 0)||[]);
  },
  currentMonth: function() {
    return moment((Session.get("special")||new Date())).format("MMMM");
  },
  personalStats: function() {
    return lodash.find(Session.get('SRPStats'), {_id: Meteor.userId()})||{};
  },
  percentage: function() {
    var loss=lodash.find(Session.get('SRPStats'), {_id: Meteor.userId()})||{};
    if (loss) {
      return Math.round((loss.gsf/1000000000)*100);
    } else {
      return 0;
    }
  },
  reimbursements: function() {
    return Template.srp.srps;
    //return Reimbursements.find({}, {sort: {killID: -1}});
  },
  errorMessages: function() {
    return _.values(Session.get(ERRORS_KEY));
  },
  errorClass: function(key) {
    return Session.get(ERRORS_KEY)[key] && 'error';
  },  
  processable: function() {
    if (Meteor.user().hasRole(["SRP","Director"])) {
      return true;
    } else {
      return false;
    }
  }  
});

Template.requestSRPModal.events({
  'submit': function(event, template) {
    event.preventDefault();

    var crest = template.$('[name=crest]').val();
    var broadcast = template.$('[name=broadcast]').val();


    if (! crest) {
      Messenger().post({  
        type:"error",  
        message: 'Crest link is required!'  
      }); 
      return;
    }

    Meteor.call('requestSRP', crest, broadcast, function(error) {
      if (error) {
        Messenger().post({
          type:"error",       
          message: error.error + " - " + error.reason 
        });  
      }
      $('#requestSRPModal').modal("hide");
      template.$('[name=crest]').val('');
      template.$('[name=broadcast]').val('');
    });
  }
});