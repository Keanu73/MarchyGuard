module.exports = {
	root: true,
	env: {
		es6: true,
		node: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
        "prettier/@typescript-eslint",
        "plugin:prettier/recommended",
	],
	globals: {
		Atomics: "readonly",
		SharedArrayBuffer: "readonly",
	},
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: "module",
		tsconfigRootDir: __dirname,
		project: ["./tsconfig.json"],
	},
	plugins: ["@typescript-eslint", "json-format"],
    rules: {
        "no-unused-expressions": "error"
    },
};
