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
    description: 'string',
    ping: {
      type: 'boolean',
      default: true
    },
    access: 'string' //'secret', 'moderated', 'public'
  },            
  indexes: {
    short: {
      fields: {
        short: 1
      },
      options: {
        unique: true
      }
    }
  },                    
  methods: {                        
  }
});

