#!env node
"use strict";

require('shelljs/global');
let path = require('path');
let _exec = require('./util')._exec;
let version = require('../package.json').version;
let rootDir = path.resolve(__dirname, '..');

cd(rootDir);

let knownProjects = ['core', 'ng1', 'ng1-bower', 'ng2'];
let projects = knownProjects.slice();

if(require.main === module && process.argv[2])
    projects = process.argv[2].split(',');

projects.forEach(project => {
    if (knownProjects.indexOf(project) === -1)
        throw new Error(`Unknwon project: ${project}; try: ${knownProjects.join(',')}`);
});

projects = projects.reduce((memo, key) => { memo[key] = true; return memo; }, {});


echo('Checking working copy status...');
_exec(`echo node ${rootDir}/scripts/ensure_clean_master.js`);

echo('Updating CHANGELOG...');
_exec(`node ${rootDir}/scripts/update_changelog.js`);

echo('Committing changelog...');
_exec(`echo git commit -m "chore(*): Update CHANGELOG" CHANGELOG.md`);

echo('Tagging...');
_exec(`echo node ${rootDir}/scripts/ensure_clean_master.js`);
_exec(`echo git tag ${version}`);

Object.keys(projects).forEach(project => {
  echo(`Packaging ${project} for npm...`);
  _exec(`node ${rootDir}/scripts/package.js ${project}`);
  cd(path.resolve(rootDir, "build_packages", project));
  
  if (test('-f', './package.json')) {
    echo(`Publishing ${project} to npm...`);
    _exec('echo npmpublishs');
  }

  if (test('-f', './bower.json')) {
    echo(`Publishing ${project} to bower...`);
    exec(`node ${rootDir}/scripts/publish_bower.js `)
  }
});

