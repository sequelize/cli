import { helpers } from './index';
import { DataTypes } from 'sequelize';

const validAttributeFunctionType: string[] = ['array', 'enum'];

/**
 * Check the given dataType actual exists.
 * @param {string} dataType
 * @returns {string}
 */
function validateDataType(dataType: string): string {
  if (!DataTypes[dataType.toUpperCase()]) {
    throw new Error(`Unknown type '${dataType}'`);
  }

  return dataType;
}

interface FormattedAttribute {
  fieldName: string;
  dataType: string;
  dataFunction: string | null;
  dataValues: string | null;
}

function formatAttributes(attribute: string): FormattedAttribute | undefined {
  let result: FormattedAttribute | undefined;
  const split: string[] = attribute.split(':');

  if (split.length === 2) {
    result = {
      fieldName: split[0],
      dataType: split[1],
      dataFunction: null,
      dataValues: null,
    };
  } else if (split.length === 3) {
    const validValues = /^\{(,? ?[A-z0-9 ]+)+\}$/;
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
        dataValues: null,
      };
    }

    if (isValidFunction && !isValidValue && isValidValues) {
      result = {
        fieldName: split[0],
        dataType: split[1],
        dataFunction: null,
        dataValues: split[2]
          .replace(/(^\{|\}$)/g, '')
          .split(/\s*,\s*/)
          .map((s) => `'${s}'`)
          .join(', '),
      };
    }
  }

  return result;
}

export const modelHelper = {
  transformAttributes(flag: string): FormattedAttribute[] {
    /*
      possible flag formats:
      - first_name:string,last_name:string,bio:text,role:enum:{Admin, 'Guest User'},reviews:array:string
      - 'first_name:string last_name:string bio:text role:enum:{Admin, Guest User} reviews:array:string'
      - 'first_name:string, last_name:string, bio:text, role:enum:{Admin, Guest User} reviews:array:string'
    */
    const attributeStrings: string[] = flag
      .split('')
      .map(
        (() => {
          let openValues = false;
          return (a: string) => {
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

  generateFileContent(args: {
    name: string;
    attributes: FormattedAttribute[];
    underscored: boolean;
  }): string {
    return helpers.template.render('models/model.js', {
      name: args.name,
      attributes: this.transformAttributes(args.attributes),
      underscored: args.underscored,
    });
  },

  generateFile(args: any): void {
    const modelPath = helpers.path.getModelPath(args.name);

    helpers.asset.write(modelPath, this.generateFileContent(args));
  },

  modelFileExists(filePath: string): boolean {
    return helpers.path.existsSync(filePath);
  },
};
