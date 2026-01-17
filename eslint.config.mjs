import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";
import pluginPrettier from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = defineConfig([
  ...nextVitals,
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
      prettier: pluginPrettier,
    },
    rules: {
      "prettier/prettier": ["error", { endOfLine: "auto" }],
      "no-console": ["warn", { allow: ["error", "info"] }],
      "react-hooks/exhaustive-deps": "error",
      "simple-import-sort/exports": "error",
      "unused-imports/no-unused-imports": "error",
      "no-unused-vars": "off",
      "react/jsx-curly-brace-presence": [
        "error",
        { props: "never", children: "never", propElementValues: "always" },
      ],
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^react", "^@?\\w"], // Packages `react` related packages come first.
            ["^next", "^@?\\w"], // Packages `next` related packages come first.
            ["^(@|components)(/.*|$)"], // Internal packages.
            ["^\\u0000"], // Side effect imports.
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"], // Parent imports. Put `..` last.
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"], // Other relative imports. Put same-folder imports and `.` last.
            ["^.+\\.?(css)$"], // Style imports.
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
