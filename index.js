#!/usr/bin/env node
const inquirer = require('inquirer')
const _ = require('lodash')
const fs = require('fs')
const globby = require('globby')
const shell = require('shelljs')
const path = require('path')
const { promisify } = require('util')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const templateDir = path.dirname(module.parent.filename)

process.on('unhandledRejection', error => {
  console.error(error)
  process.exit(1)
})

const getOutputFile = file => file.replace(/templates\//g, '')
  .replace(/^_/g, '.') // change _ file back to . files

const writeTemplate = async (inputFile, properties) => {
  const underscoreParams = {
    evaluate: /\<\%([\s\S]+?)\%\>/g, // eslint-disable-line
    interpolate: /\<\%\=([\s\S]+?)\%\>/g, // eslint-disable-line
    escape: /\<-([\s\S]+?)\>/g // eslint-disable-line
  }
  const outputFile = `./${getOutputFile(inputFile)}`
  const data = await readFile(path.join(templateDir, inputFile))

  const template = _.template(data, underscoreParams)

  if (fs.existsSync(outputFile)) {
    console.log('file exists: ', outputFile)
    throw new Error(`File already exists: ${outputFile}`)
  }

  shell.mkdir('-p', path.dirname(outputFile))
  await writeFile(outputFile, template({
    imports: { _ },
    properties
  }))
  console.log(`finished writing: ${inputFile}`)
}

const generateFiles = async (properties, globPattern) => {
  const templateFiles = await globby(globPattern, { cwd: templateDir })
  return Promise.all(templateFiles.map(item => writeTemplate(item, properties)))
}

const go = async (prompts, folders = ['templates/**/*']) => {
  const answers = await inquirer.prompt(prompts)

  await generateFiles(answers, folders)
  return answers
}

module.exports = go
