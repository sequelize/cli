import helpers from './index';

const Sequelize = helpers.generic.getSequelize();
const validAttributeFunctionType = ['array', 'enum'];

/**
 * Check the given dataType actual exists.
 * @param {string} dataType
 */
function validateDataType (dataType) {
  if (!Sequelize.DataTypes[dataType.toUpperCase()]) {
    throw new Error(`Unknown type '${dataType}'`);
  }

  return dataType;
}

function validateRelation(relation) {
  const options = ['belongsTo', 'hasOne', 'hasMany', 'belongsToMany'];
  if (!options.includes(relation)) {
    throw new Error(`Unknown relation '${relation}'`);
  }
}

function formatAttributes (attribute) {
  let result;
  const split = attribute.split(':');

  if (split.length === 2) {
    result = { fieldName: split[0], dataType: split[1], dataFunction: null, dataValues: null };
  } else if (split.length === 3) {
    const validValues = /^\{(,? ?[A-z0-9 ]+)+\}$/;
    const isValidFunction = validAttributeFunctionType.indexOf(split[1].toLowerCase()) !== -1;
    const isValidValue = validAttributeFunctionType.indexOf(split[2].toLowerCase()) === -1 && split[2].match(validValues) === null;
    const isValidValues = split[2].match(validValues) !== null;

    if (isValidFunction && isValidValue && !isValidValues) {
      result = { fieldName: split[0], dataType: split[2], dataFunction: split[1], dataValues: null };
    }

    if (isValidFunction && !isValidValue && isValidValues) {
      result = { fieldName: split[0], dataType: split[1], dataFunction: null, dataValues: split[2].replace(/(^\{|\}$)/g, '').split(/\s*,\s*/).map(s => `'${s}'`).join(', ') };
    }
  }

  return result;
}

function formatAssociations (source, association) {
  const split = association.split(':');
  validateRelation(split[0]);
  const relation = { source,  relation: split[0], model: split[1], target: split[1], columnName:  split[1] };

  if (relation.relation !== 'belongsToMany') {
    relation.source = helpers.migration.getTableName(relation.source);
    relation.target = helpers.migration.getTableName(relation.target);
    if (relation.relation !== 'belongsTo') {
      source = relation.source;
      relation.source = relation.target;
      relation.target = source;
    }
  } else {
    relation.through = source + helpers.migration.getTableName(relation.target);
  }

  return relation;
}
const splitString = flag => flag.split('').map((() => {
  let openValues = false;
  return a => {
    if ((a === ',' || a === ' ') && !openValues) {
      return '  ';
    }
    if (a === '{') {
      openValues = true;
    }
    if (a === '}') {
      openValues = false;
    }

    return a;
  };
})()).join('').split(/\s{2,}/);

module.exports = {
  transformAttributes (flag) {
    /*
      possible flag formats:
      - first_name:string,last_name:string,bio:text,role:enum:{Admin, 'Guest User'},reviews:array:string
      - 'first_name:string last_name:string bio:text role:enum:{Admin, Guest User} reviews:array:string'
      - 'first_name:string, last_name:string, bio:text, role:enum:{Admin, Guest User} reviews:array:string'
    */
    const attributeStrings = splitString(flag);

    return attributeStrings.map(attribute => {
      const formattedAttribute = formatAttributes(attribute);

      try {
        validateDataType(formattedAttribute.dataType);
      } catch (err) {
        throw new Error(`Attribute '${attribute}' cannot be parsed: ${err.message}`);
      }

      return formattedAttribute;
    });
  },

  transformAssociations ({name, associations}) {
    /*
      possible flag formats:
      - belongsTo:ModelName, hasOne:ModelName, hasMany:ModelName, belongsToMany:ModelName
    */
    const associationStrings = splitString(associations);

    return associationStrings.map(association => formatAssociations(name, association))
      .reduce((acc, curr) => {
        if (curr.relation !== 'belongsToMany') {
          acc[0].push(curr);
        } else {
          acc[1].push(curr);
        }
        return acc;
      }, [[], []]);
  },

  generateFileContent (args) {
    const associations = args.associations ? this.transformAssociations(args) : [];
    return helpers.template.render('models/model.js', {
      name:       args.name,
      attributes: this.transformAttributes(args.attributes),
      associations: associations.length ? associations[0].concat(associations[1]) : [],
      underscored: args.underscored
    });
  },

  generateFile (args) {
    const modelPath = helpers.path.getModelPath(args.name);

    helpers.asset.write(modelPath, this.generateFileContent(args));
  },

  modelFileExists (filePath) {
    return helpers.path.existsSync(filePath);
  }
};
