class SchemaCreator {
  constructor() {

  }

  mergeSchemaAndFields(schema, account, type) {
    return Model.fields.find({account: account, schemaType: type}).then((fields) => {
      if (fields && fields.length > 0) {
        fields.forEach((field) => {
          const fieldName = this._camelize(field.name);
          let obj = {
            title: field.name
          };

          if (field.type === 'date') {
            obj.type = 'string';
            obj.format = 'date';
          } else {
            obj.type = field.type;
          }
          if (field.enum && field.enum.length > 0) {
            obj.enum = field.enum;
          }
          if (field.required && field.type === 'string') {
            obj.required = true;
          }

          if (field.pattern) {
            obj.pattern = field.pattern;
          }

          schema.properties[fieldName] = obj;
        });
      }

      return schema;
    })
  }

  _camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
      if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
      return index == 0 ? match.toLowerCase() : match.toUpperCase();
    });
  }
}

module.exports = new SchemaCreator();