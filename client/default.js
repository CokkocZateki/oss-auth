Template.default.rendered = function() {
  Messenger.options = {
    extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
    theme: 'flat',
    showCloseButton: true
  }

  Notifications.find().observe({
    added: function(doc) {
      Messenger().post({
        type: doc.type||'info',
        message: doc.message,
        id: doc._id,
        hideAfter: doc.hideAfter||5,
        showCloseButton: doc.showCloseButton||false
      });
      Notifications.update(doc._id, {$set: {shown: true}});
    }
  });
};

UI.registerHelper('hasRole', function(role) {
  return (Meteor.user() && Meteor.user().hasRole(role))?true:false;
});

UI.registerHelper('routeEquals', function(path) {
  return Router.current().location.get().path==path?"active":"";
});

UI.registerHelper('user', function(u) {
  if (u) return Meteor.users.findOne(u).username;
});

UI.registerHelper('mumbleize', function(input) {
  return input.replace("'","");
});

UI.registerHelper('jabberize', function(input) {
  return input.toLowerCase().replace(/ /g,"_").replace("'","");
});

UI.registerHelper('ticker', function() {
  if (Metoer.user())
    return Meteor.user().group();
});

UI.registerHelper('formatTime', function(context, options) {
  if(context)
    return moment(Date.parse(context)).format('YYYY-MM-DD HH:mm');
});

UI.registerHelper('formatTimeUTC', function(context, options) {
  if(context)
    return moment(Date.parse(context)).utc().format('YYYY-MM-DD HH:mm');
}); 

UI.registerHelper('join', function(context, options) {
  if(context)
    return context.join(options||"")
});
 
UI.registerHelper('map', function(context, options) {
  if(context && options)
    return _.map(context, function(i) { return i[options]; }).join("<br>");
});

UI.registerHelper('parseTitles', function(titles) {
   var result=[];
  _.each(titles, function(v,k) {
    result.push(parseTitle(v.titleName));
  });
  return result;
});

parseTitle = function(title) {
  var result={};
  var partsR = new RegExp("(<.*>)(.*)(<.*>)");
  var colorR = new RegExp("(?:#|0x)?(?:[0-9a-fA-F]{2}){3,4}"); 
  var parts = title.match(partsR);
  if (!parts) return {title: title, color: null};
  var color=parts[1].match(colorR)[0].slice(4);
  result.color="#"+color;
  result.title=parts[2]; 
  return result;
}

UI.registerHelper('parseTitle', parseTitle);

UI.registerHelper('generateDNA', function(ship, items) {
  var dna = {};
  dna[ship] = 1;
  _.each(items, function(item) {
    if (item.flag != 5 && item.flag != 155) {
      dna[item.itemType.id] = dna[item.itemType.id]||0;
      dna[item.itemType.id] += (item.quantityDropped||0)+(item.quantityDestroyed||0);
    }
  });
  var t = _.map(dna, function(v,k) { return k+";"+v; }); 
  var dnastring=t.join(":");
  return dnastring;
});

UI.registerHelper('formatJSON', function(context, options) {
  if(context)
    return JSON.stringify(context);
});

UI.registerHelper('formatISK', function(context, options) {
  return (context||0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')+" ISK";
});