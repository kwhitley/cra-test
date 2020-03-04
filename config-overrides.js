const { 
  disableEsLint,
  useBabelRc, 
  override, 
  useEslintRc,
} = require('customize-cra')

module.exports = override(
  useBabelRc(),
  // useEslintRc(),
  disableEsLint(),
)