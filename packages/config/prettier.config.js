/** packages/config/prettier.config.js */
module.exports = {
  semi: false,
  singleQuote: true,
  trailingComma: "es5",
  arrowParens: "avoid",
  printWidth: 100,
  tabWidth: 2,
  plugins: [require("prettier-plugin-tailwindcss")],
};
