Groups = new Mongo.Collection("groups");

Group = Astro.Class({    
  name: 'Group',
  collection: Groups,
  /*{ _id: '5EWfJX8SJvbno9mPt',
    name: 'Black Omega Security',
      short: 'OMEGA' }*/
  fields: {            
    name: 'string',
    short: 'string',
    type: 'string'
  },                                
  methods: {                        
  }
});

