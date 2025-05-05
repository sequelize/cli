import helpers from './index';

const Sequelize = helpers.generic.getSequelize();
const validAttributeFunctionType = ['array', 'enum'];
const typescriptTypesForDbFieldTypes = {
  string: 'string',
  text: 'string',
  uuid: 'string',
  CHAR: 'string',
  number: 'number',
  float: 'number',
  integer: 'number',
  bigint: 'number',
  mediumint: 'number',
  tinyint: 'number',
  smallint: 'number',
  double: 'number',
  'double precision': 'number',
  real: 'number',
  decimal: 'number',
  date: 'data',
  now: 'data',
  dateonly: 'data',
  boolean: 'boolean',
};

/**
 * Check the given dataType actual exists.
 * @param {string} dataType
 */
function validateDataType(dataType) {
  if (!Sequelize.DataTypes[dataType.toUpperCase()]) {
    throw new Error(`Unknown type '${dataType}'`);
  }

  return dataType;
}

function getTsTypeForDbColumnType(db_type, attribute_func, values) {
  db_type = db_type.toLowerCase();
  if (attribute_func === 'array') {
    return `${typescriptTypesForDbFieldTypes[db_type]}[]`;
  } else if (attribute_func === 'enum') {
    return values.join(' | ');
  }

  return typescriptTypesForDbFieldTypes[db_type] || 'any';
}

function formatAttributes(attribute) {
  let result;
  const split = attribute.split(':');

  if (split.length === 2) {
    result = {
      fieldName: split[0],
      dataType: split[1],
      dataFunction: null,
      tsType: getTsTypeForDbColumnType(split[1]),
      dataValues: null,
    };
  } else if (split.length === 3) {
    const validValues =
      /^\{((('[A-z0-9 ]+')|("[A-z0-9 ]+")|([A-z0-9 ]+)))(, ?(('[A-z0-9 ]+')|("[A-z0-9 ]+")|([A-z0-9 ]+)))*\}$/;

    const isValidFunction =
      validAttributeFunctionType.indexOf(split[1].toLowerCase()) !== -1;
    const isValidValue =
      validAttributeFunctionType.indexOf(split[2].toLowerCase()) === -1 &&
      split[2].match(validValues) === null;
    const isValidValues = split[2].match(validValues) !== null;

    if (isValidFunction && isValidValue && !isValidValues) {
      result = {
        fieldName: split[0],
        dataType: split[2],
        dataFunction: split[1],
        tsType: getTsTypeForDbColumnType(split[2], split[1]),
        dataValues: null,
      };
    }

    if (isValidFunction && !isValidValue && isValidValues) {
      const values = split[2]
        .replace(/(^\{|\}$)/g, '')
        .split(/\s*,\s*/)
        .map((s) => (s.startsWith('"') || s.startsWith("'") ? s : `'${s}'`));

      result = {
        fieldName: split[0],
        dataType: split[1],
        tsType: getTsTypeForDbColumnType(split[2], split[1], values),
        dataFunction: null,
        dataValues: values.join(', '),
      };
    }
  }

  return result;
}

module.exports = {
  transformAttributes(flag) {
    /*
      possible flag formats:
      - first_name:string,last_name:string,bio:text,role:enum:{Admin, 'Guest User'},reviews:array:string
      - 'first_name:string last_name:string bio:text role:enum:{Admin, Guest User} reviews:array:string'
      - 'first_name:string, last_name:string, bio:text, role:enum:{Admin, Guest User} reviews:array:string'
    */
    const attributeStrings = flag
      .split('')
      .map(
        (() => {
          let openValues = false;
          return (a) => {
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
        })()
      )
      .join('')
      .split(/\s{2,}/);

    return attributeStrings.map((attribute) => {
      const formattedAttribute = formatAttributes(attribute);

      try {
        validateDataType(formattedAttribute.dataType);
      } catch (err) {
        throw new Error(
          `Attribute '${attribute}' cannot be parsed: ${err.message}`
        );
      }

      return formattedAttribute;
    });
  },

  generateFileContent(args) {
    return helpers.template.render('models/model.js', {
      name: args.name,
      attributes: this.transformAttributes(args.attributes),
      underscored: args.underscored,
    });
  },

  generateFile(args) {
    const modelPath = helpers.path.getModelPath(args.name);

    helpers.asset.write(modelPath, this.generateFileContent(args));
  },

  modelFileExists(filePath) {
    return helpers.path.existsSync(filePath);
  },
};
