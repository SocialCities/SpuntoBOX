'use strict';

module.exports = {
  path: '/schemas',
  actions: {
    'get /:account/:schemaType': [function(req, res, next) {
      Model.schemas.findOne({type: req.params.schemaType}).then((schema) => {
        return Service.SchemaCreator.mergeSchemaAndFields(schema.schema, req.params.account, req.params.schemaType);
      }).then((schema) => {
        res.send(schema);
      }).catch((err) => {
        console.log('customers Error', err);
      })
    }],
    'post /:account/:schemaType/field': [function(req, res, next) {

      let field = {};
      if (req.body.type === 'text' || req.body.type === 'select') {
        field.type = 'string';
      }

      field.name = req.body.title;

      field.account = req.params.account;
      field.schemaType = req.params.schemaType;
      if (req.body.fisc === true) {
        field.pattern = "^[A-Za-z]{6}[0-9]{2}[A-Za-z]{1}[0-9]{2}[A-Za-z]{1}[0-9]{3}[A-Za-z]{1}$";
      }
      if (req.body.iva === true) {
        field.pattern = "^[0-9]{11}$";
      }
      if (req.body.enum && req.body.enum.length > 0) {
        field.enum = req.body.enum;
      }
      Model.fields.create(field).then((f) => {
        res.send(f);
      }).catch((err) => {
        res.status(500).send(err);
        console.log('customers Error', err);
      });
    }],
  },

  sockets: {
    self: function (cb) {
      
    },
  }
};
