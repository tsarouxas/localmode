import { app, BrowserWindow, ipcMain, shell } from 'electron';
const os = require('os-utils');
const fs = require('fs');
const { exec } = require('child_process');
const { spawn } = require('child_process');

//TODO
//https://github.com/electron/electron/issues/21674
/* Event Handlers */


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;




/*Helper Functions */
const shell_callback = (err, stdout, stderr) => {
    if (err) {
        console.log(`exec error: ${err}`);
        return;
    } else {
        //console.log(`${stdout}`);
        mainWindow.webContents.send('main-ping', 'asdda');
        //mainWindow.webContents.send('main-ping',`${stdout}`);
    }
}



/* START INIT*/
const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 680,
        'minHeight': 600,
        'minWidth': 1025,
        webPreferences: {
            nodeIntegration: true
        },
        titleBarStyle: 'hidden'
    });

    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    //INIT - Start the game
    // setInterval(() => {

    os.cpuUsage(function(v) {
        //console.log('cpu',v*100);
        mainWindow.webContents.send('cpu', v * 100);
    });


    //},1000);

    //console.log(ipcMain);
    ipcMain.on('cpu', (event, data) => {
        console.log('cpu % ' + data);

    });

    ipcMain.on('update-wordget-credentials', (event, arg) => {
        console.log('running update-wordget-credentials' + arg);
        console.log(arg);
        //event.returnValue = await exec('ls -al', shell_callback);
        let lyrics = 'But still I\'m having memories of high speeds when the cops crashed\n' +
            'As I laugh, pushin the gas while my Glocks blast\n' +
            'We was young and we was dumb but we had heart';

        // write to a new file named 2pac.txt
        fs.writeFile('2pac.txt', lyrics, (err) => {
            // throws an error, you could also catch it here
            if (err) throw err;

            // success case, the file was saved
            console.log('Lyric saved!');
            event.sender.send('result-wordget-update', 'success');
        });

    });

    // Event handler for asynchronous incoming messages
    ipcMain.on('main-start', (event, arg) => {
        console.log(arg);
        // Event emitter for sending asynchronous messages

        //Get a list of all websites on localhost
        //let res = exec('ls -al', shell_callback);

        const child = spawn('pwd');
        //const child = spawn('find', ['.', '-type', 'f']);
        /* child.stdout.on('data', (data) => {
          console.log(`child stdout:\n${data}`);
          //mainWindow.webContents.send('pwd',`child stdout:\n${data}`);
          event.sender.send('pwd',`child stdout:\n${data}`);
          event.sender.send('asynchronous-reply', 'async pong');
        });

        child.stderr.on('data', (data) => {
          console.error(`child stderr:\n${data}`);
        });
        child.on('exit', function (code, signal) {
          console.log('child process exited with ' +
                      `code ${code} and signal ${signal}`);
        }); */

        /* Get a list of all current localhost links and PING the frotend to REFRESH the list of sites as well as the oSites object */
        exec("valet links | sed '1,3d' | sed '$d'", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            event.sender.send('get_sites_list', `${stdout}`);
        });

    })


    /* Valet Functions */
    ipcMain.on('restart-valet', (event, arg) => {
        exec("valet restart", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            event.sender.send('restart-valet-response', `${stdout}`);
        });
    })



    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});