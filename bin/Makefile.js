'use strict';

/* global cat, cd, cp, echo, exec, exit, find, ls, mkdir, pwd, rm, target, test */

require('shelljs/make');

var path = require('path'),
    spawn = require('child_process').spawn,
    fs = require('fs'),
    shell = require('shelljs');


target.release = function (args) {
    if (!args) {
        console.log('No version type provided. Please specify release type patch/minor/major');
        return;
    }
    var type = args[0].replace(/"/g, '');
    if (['patch', 'minor', 'major'].indexOf(type) >= 0) {
        console.log('Updating package.json version with ' + args[0] + ' release.');
        var version = spawn('npm version ' + args[0], { stdio: 'inherit', shell: true });
        var propertiesFileName = path.resolve('./cartridges/app_storefront_base/cartridge/templates/resources/version.properties')

        version.on('exit', function (code) {
           if (code === 0) {
               var versionNumber = JSON.parse(fs.readFileSync('./package.json').toString()).version;
               //modify version.properties file
               var propertiesFile = fs.readFileSync(propertiesFileName).toString();
               var propertiesLines = propertiesFile.split('\n');
               var newLines = propertiesLines.map(function (line) {
                   if (line.indexOf('global.version.number=') === 0) {
                       line = 'global.version.number=' + versionNumber;
                   }
                   return line;
               });
               fs.writeFileSync(propertiesFileName, newLines.join('\n'));
               shell.exec('git add -A');
               shell.exec('git commit -m "Release ' + versionNumber + '"');
               console.log('Version updated to ' + versionNumber);
               console.log('Please do not forget to push your changes to the integration branch');
           }
        });
    } else {
        console.log('Could not release new version. Please specify version type (patch/minor/major).');
    }
}
