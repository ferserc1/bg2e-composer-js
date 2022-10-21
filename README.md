# bg2 engine Composer - JavaScript

## IMPORTANT

This editor works with a deprecated version of bg2 engine. We have integrated all bg2 engine, bg2e physics and bg2e voxel dependencies into this repository.

The version of Electron used for this project is not available on Mac computers with Apple Silicon processors, so it is not possible to debug the main process. However, from this version onwards, all the source code files are included without compiling or packaging, so it is possible to debug the renderer process by simply running the application and accessing the development tools through the application:

- File > plugin settings > open developer tools

### Important note for Apple Silicon Macs

It is necessary to use Electron v5, which is not available on some platforms because it is a very old version. For example, this version does not work on Mac computers with Apple Silicon processors, as the installer tries to download the binary executables for a version that does not exist (arm64). 

If you are working with Apple Silicon, you can avoid this problem by opening the terminal in x86 mode. To do this, just show the properties of the Terminal.app application in the Finder, and enable the option to run in Rosetta mode. The most convenient option is to duplicate the Terminal.app application, changing the name to Terminal x86.app, and then you can have one terminal for Apple Silicon and another for Intel.

### Install

Download the Electron base binary files for your platform:

- [https://www.bg2engine.org/dependencies/composer-bin-base-win64.zip](https://www.bg2engine.org/dependencies/composer-bin-base-win64.zip)
- [https://www.bg2engine.org/dependencies/composer-bin-base-mac.zip](https://www.bg2engine.org/dependencies/composer-bin-base-mac.zip)

Uncompress the base files and clone this repository in the appropiate resource folder:

- Windows: composer/resources/app
- Mac: Compser.app/Contents/Resources/app

Note: the app folder is the folder containing the repository code. The following configuration would be wrong:

- Windows: composer/resources/app/bg2e-composer-js  > wrong!
- Mac: Composer.app/Contents/Resources/app/bg2e-composer-js  > wrong!

Download and uncompress de binary dependencies:

[https://www.bg2engine.org/dependencies/bg2e-composer-bin-deps.zip](https://www.bg2engine.org/dependencies/bg2e-composer-bin-deps.zip)

- app (composer repo)/deps/bin

After this step, the `deps/bin` folder will contain:

deps/bin
 - bg2e-raytracer-dist
 - bg2e-scene-pkg
 - fbx2json-dist

From the main repository (app) folder, run the following commands:

```sh
npm install
npm run build
```

You are now ready to run Composer:

- Windows: composer/composer.exe
- Mac: Composer.app

## Debug using Electron


To debug the application with Electron it is not necessary to clone the repository inside the electron binary files (`resources/app` folder). Just execute the steps mentioned in point 1 and launch the application with:

```js
npm run debug
```

Please note that this option will only work with platforms that are supported by Electron v5.

## External plugins

To use all the Composer external plugins, it's better to download this repository using the bg2 engine download and installation scripts that you can find here:

[https://github.com/ferserc1/bg2e](https://github.com/ferserc1/bg2e)

## Troubleshooting

The first time the application is run, it fails to find the preferences. The result is that the menus do not load correctly. Simply close and reopen the application to solve this problem.
