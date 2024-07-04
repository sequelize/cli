<!--
Please fill in the template below.
If unsure about something, just do as best as you're able.

You may skip the template below, if
 - You are only updating documentation
 - You are only fixing minor issue, which does not impact public API
-->

### Pull Request check-list

_Please make sure to review and check all of these items:_

- [x] Does `npm run test` pass with this change (including linting)?
- [x] Does the description below contain a link to an existing issue (Closes #1139) or a description of the issue you are solving?
- [x] Have you added new tests to prevent regressions?
- [x] Is a documentation update included (if this change modifies existing APIs, or introduces new ones)?

<!-- NOTE: these things are not required to open a PR and can be done afterwards / while the PR is open. -->

### Description of change
The following files have been changed:
>model_generate.js
>yargs.js
>model.js
>model-helper.js
>migration-helper.js
>create-table.js
>create.test.js

solved issue: 
>https://github.com/sequelize/cli/issues/1139

The following test has been adapted: 
>model/create.test.js

update to the documentation: 

>In order to be able to assign the paranoid flag via the CLI, it is possible to set the flag ```--paranoid true``` after the ```model:generate``` 

>You can also set the paranoid flag to true in the ```.sequelizerc``` , so all created models and migrations will be paranoid by default. 

>If you have set paranoid to true in the config, you can set paranoid to false for individual tables by setting the flag to ```--paranoid false``` via the CLI after the ```model:generate```