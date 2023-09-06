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
+-- lib               # re-exporting different libraries preconfigured for the application
|
+-- routes            # routes configuration
|
+-- screens           # application screens
```

## Components and Styling

**TailwindCSS**

TailwindCSS is a utility-first CSS framework that allows you to build custom designs without having to write custom CSS. With the help of [tailwind-react-native-classnames](https://github.com/jaredh159/tailwind-react-native-classnames) you can utilize the same beloved Tailwind CSS utility classes you are familiar with from web development, seamlessly in your React Native applications.

## Deployment

**GitHub Actions**

GitHub Actions is a CI/CD tool that allows you to automate your software development workflows. This project has been configured to automatically build and deploy the application to Expo whenever a new commit is pushed to the `main` or `development` branch.

**EAS**

Expo Application Services (EAS) is a set of tools that allow you to build, deploy, and manage your Expo applications. This project has been configured to automatically build and deploy the application to Expo whenever a new commit is pushed to the `main` or `development` branch.

## Authors

- [Christian De Guzman](https://github.com/ChristianDeGuzmanUF)
- [Vincent Fleming](https://github.com/FlemingVincent)
- [Jinfan Tu](https://github.com/VicTu946)
- [Phillip Vanderlaat](https://github.com/pvanderlaat)
- [Gabriel Velasquez](https://github.com/gabcoroba)
