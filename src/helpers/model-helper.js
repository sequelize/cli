import helpers from './index';

const Sequelize = helpers.generic.getSequelize();
const validAttributeFunctionType = 'array';

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

function formatAttributes (attribute) {
  let result;
  const split = attribute.split(':');

  if (split.length === 2) {
    result = { fieldName: split[0], dataType: split[1], dataFunction: null };
  } else if (split.length === 3) {
    const isValidFunction = validAttributeFunctionType === split[1].toLowerCase();
    const isValidValue = validAttributeFunctionType !== split[2].toLowerCase();

    if (isValidFunction && isValidValue) {
      result = { fieldName: split[0], dataType: split[2], dataFunction: split[1] };
    }
  }
  return result;
}

module.exports = {
  transformAttributes (flag) {
    /*
      possible flag formats:
      - first_name:string,last_name:string,bio:text,reviews:array:string
      - 'first_name:string last_name:string bio:text reviews:array:string'
      - 'first_name:string, last_name:string, bio:text, reviews:array:string'
    */

    const attributeStrings = flag.replace(/,/g, ' ').split(/\s+/);

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

  generateFileContent (args) {
    return helpers.template.render('models/model.js', {
      name:       args.name,
      attributes: this.transformAttributes(args.attributes),
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
