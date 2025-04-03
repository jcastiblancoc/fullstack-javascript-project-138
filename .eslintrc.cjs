module.exports = {
  extends: ["airbnb-base"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  env: {
    node: true,
    jest: true,
  },
  plugins: ["import"], // Añade esto para el plugin de import
  rules: {
    "no-console": "off",
    "import/extensions": ["error", "always"],
    "no-underscore-dangle": ["error", { allow: ["__dirname", "__filename"] }],
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
  },
  globals: {
    jest: true,
    describe: true,
    test: true,
    expect: true,
    beforeEach: true,
    process: true,
  },
};
