/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
'use strict'

const fs = require('fs')
const path = require('path')
const rules = require('./lib/rules')
const categories = require('./lib/categories')

// -----------------------------------------------------------------------------
const uncategorizedRules = rules.filter(rule => !rule.meta.docs.category && !rule.meta.deprecated)
const deprecatedRules = rules.filter(rule => rule.meta.deprecated)

function toRuleRow (rule) {
  const mark = `${rule.meta.fixable ? ':wrench:' : ''}${rule.meta.deprecated ? ':warning:' : ''}`
  const link = `[${rule.ruleId}](./${rule.name}.md)`
  const description = rule.meta.docs.description || '(no description)'

  return `| ${link} | ${description} | ${mark} |`
}

function toDeprecatedRuleRow (rule) {
  const link = `[${rule.ruleId}](./${rule.name}.md)`
  const replacedRules = rule.meta.docs.replacedBy || []
  const replacedBy = replacedRules
    .map(name => `[vue/${name}](./${name}.md)`)
    .join(', ')

  return `| ${link} | ${replacedBy || '(no replacement)'} |`
}

// -----------------------------------------------------------------------------
let rulesTableContent = categories.map(category => `
## ${category.title}

Enforce all the rules in this category, as well as all higher priority rules, with:

\`\`\`json
{
  "extends": "plugin:vue/${category.categoryId}"
}
\`\`\`

| Rule ID | Description |    |
|:--------|:------------|:---|
${category.rules.map(toRuleRow).join('\n')}
`).join('')

// -----------------------------------------------------------------------------
if (uncategorizedRules.length >= 1) {
  rulesTableContent += `
## Uncategorized

No preset enables the rules in this category.
Please enable each rule if you want.

For example:

\`\`\`json
{
  "rules": {
    "${uncategorizedRules[0].ruleId}": "error"
  }
}
\`\`\`

| Rule ID | Description |    |
|:--------|:------------|:---|
${uncategorizedRules.map(toRuleRow).join('\n')}
`
}

// -----------------------------------------------------------------------------
if (deprecatedRules.length >= 1) {
  rulesTableContent += `
## Deprecated

- :warning: We're going to remove deprecated rules in the next major release. Please migrate to successor/new rules.
- :innocent: We don't fix bugs which are in deprecated rules since we don't have enough resources.

| Rule ID | Replaced by |
|:--------|:------------|
${deprecatedRules.map(toDeprecatedRuleRow).join('\n')}
`
}

// -----------------------------------------------------------------------------
const readmeFilePath = path.resolve(__dirname, '../docs/rules/README.md')
fs.writeFileSync(
  readmeFilePath,
  `---
sidebarDepth: 0
---

<!-- This file is automatically generated in tools/update-docs-rules-index.js, do not change! -->

# Available rules
${rulesTableContent}`
)
