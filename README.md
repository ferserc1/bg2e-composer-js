# bg2 engine Composer - JavaScript

## Requirements

It is necessary to have Node.js installed, which you can obtain for your operating system at the following URL:

[https://nodejs.org/](https://nodejs.org/)

You will also need to install Electron.js in the system. The installation is done directly from Node's package manager (npm), from the command line:

```
npm install -g electron
```

### Notes about electron installation:

In Linux/Unix systems you have to install electron.js with root permissions:

```
sudo npm install -g electron
```

On some systems, there is a bug in electron.js that causes the installation process to fail:

```
$ sudo npm install -g electron
Password:
/usr/local/bin/electron -> /usr/local/lib/node_modules/electron/cli.js

> electron@4.0.1 postinstall /usr/local/lib/node_modules/electron
> node install.js

/usr/local/lib/node_modules/electron/install.js:49
  throw err
  ^

Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules/electron/.electron'
...
```

There is a workaround to fix this problem, adding the following parameters to npm:

```
$ sudo npm install -g electron --unsafe-perm=true --allow-root
```

### Download dependencies and run Composer

Navigate to the bg2e-composer path and type the following command to install the dependencias:

```
$ npm install
```

Now, compile the sources with the following command:

```
$ gulp
```

After that, you can run Composer typing:

```
$ electron main.js
```

### Debug

You can debug Composer using the following command to run it:

```
$ electron main-debug.js
```

Launching Composer in this way directly uses the uncompiled source code files, and enables Electron's debugging tools, which you can open from the menu `View > Toggle Developer Tools`

### External plugins

To use all the Composer external plugins, it's better to download this repository using the bg2 engine download and installation scripts that you can find here:

[https://github.com/ferserc1/bg2e](https://github.com/ferserc1/bg2e)
