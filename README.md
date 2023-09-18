# Circles

## Setup

1. Clone the repository

```bash
git clone https://github.com/FlemingVincent/Circles.git
```

2. Navigate to the project directory

```bash
cd Circles
```

3. Install dependencies

```bash
yarn install
```

4. Start the development server

```bash
yarn start
```

## Project Configuration

This project has been configured with the following tools:

**ESLint**

ESLint is a linting tool for JavaScript that enforces coding best practices.

[ESLint Configuration](https://github.com/FlemingVincent/circles/blob/main/.eslintrc.js)

**Prettier**

Prettier is a code formatter that enforces a consistent code style. Within this project it has been configured to run with ESLint.

[Prettier Configuration](https://github.com/FlemingVincent/circles/blob/main/.prettierrc)

**TypeScript**

TypeScript is a superset of JavaScript that adds static typing to the language. It is used to improve code quality and developer productivity.

**Absolute Imports**

Absolute imports allow you to import modules using the project root as the base path. This makes it easier to import modules without having to worry about relative paths.

`tsconfig.json`

```json
{
	"extends": "expo/tsconfig.base",
	"compilerOptions": {
		"strict": true,
		"baseUrl": ".",
		"paths": {
			"@/*": ["src/*"]
		}
	}
}
```

`app.json`

```json
{
	"expo": {
		"experiments": {
			"tsconfigPaths": true
		}
	}
}
```

## Project Structure

Most of the code lives in the `src` directory. The `src` directory contains the following subdirectories:

```sh
src
|
+-- assets            # assets folder can contain all the static files such as images, fonts, etc.
|
+-- components        # shared components used across the entire application
|
+-- config						# all the global configuration, env variables etc. get exported from here and used in the app
|
+-- lib               # re-exporting different libraries preconfigured for the application
|
+-- providers					# all of the application providers
|
+-- routes            # routes configuration
|
+-- screens           # application screens
```

## Components and Styling

**TailwindCSS**

TailwindCSS is a utility-first CSS framework that allows you to build custom designs without having to write custom CSS. With the help of [tailwind-react-native-classnames](https://github.com/jaredh159/tailwind-react-native-classnames) you can utilize the same beloved Tailwind CSS utility classes you are familiar with from web development, seamlessly in your React Native applications.

## Error Handling

**React Hook Form**

React Hook Form is a library that allows you to easily create forms in React. It is used to create performant, flexible, and extensible forms with easy-to-use validation.

**Zod**

Zod is a TypeScript-first schema declaration and validation library. It is used in conjunction with React Hook Form to validate form data.

## Deployment

**GitHub Actions**

GitHub Actions is a CI/CD tool that allows you to automate your software development workflows. This project has been configured to automatically build and deploy the application to Expo whenever a new commit is pushed to the `main` or `development` branch.

**EAS**

Expo Application Services (EAS) is a set of tools that allow you to build, deploy, and manage your Expo applications. This project has been configured to automatically build and deploy the application to Expo whenever a new commit is pushed to the `main` or `development` branch.

## Contributing

Assuming you've already completed the setup, to start contributing please follow these steps:

1. **Create a new branch:** Before making any changes, create a new branch with a descriptive name. Follow this convention to choose an appropriate prefix for your branch name:

   - `hotfix`: For quickly fixing critical issues, usually with a temporary solution.
   - `bugfix`: For fixing a bug.
   - `feature`: For adding, removing, or modifying a feature.
   - `test`: For experimenting with something which is not an issue.
   - `wip`: For a work in progress.

   Example: `feature/update-readme`

2. **Make Changes:** Implement the desired changes in your branch.

3. **Test Changes:** Before proceeding, ensure that your changes work as expected.

4. **Push Branch and Open a Pull Request:** Once you're confident in your changes, push your branch to the repository and open a pull request from your branch into the development branch.

5. **Merge Pull Request:** After review and approval, your pull request will be merged into the development branch.

**Note:** Please ensure that you base your branch off the development branch, not the main branch.

## Authors

- [Christian De Guzman](https://github.com/ChristianDeGuzmanUF)
- [Vincent Fleming](https://github.com/FlemingVincent)
- [Jinfan Tu](https://github.com/VicTu946)
- [Phillip Vanderlaat](https://github.com/pvanderlaat)
- [Gabriel Velasquez](https://github.com/gabcoroba)
