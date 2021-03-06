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


    ipcMain.on('fetch-wordget-credentials', (event, site_folder) => {
        console.log('running fetch-wordget-credentials from' + site_folder);
        //read wordget credentials if they  exist in .wordget.json
        let site_wordget_file = site_folder + '/.wordget.json';
        try {
            if (fs.existsSync(site_wordget_file)) {
                fs.readFile(site_wordget_file, (err, file_data) => {
                    if (err) throw err;
                    event.sender.send('result-fetch-wordget-credentials', file_data);
                });
            }
        } catch (err) {
            console.error(err)
        }
    });


    ipcMain.on('update-wordget-credentials', (event, data) => {
        // console.log('running update-wordget-credentials' + data);
        // console.log(data.site_folder);
        // console.log(data.site_folder + '/.wordget.json');
        //event.returnValue = await exec('ls -al', shell_callback);
        // write to a new file named 2pac.txt

        let data_wordget = {
            wordget_user: data.wordget_user,
            wordget_server: data.wordget_server,
            wordget_port: data.wordget_port,
            wordget_folder: data.wordget_folder
        }

        if (data.site_folder) {
            let json_data = JSON.stringify(data_wordget, null, 2);
            fs.writeFile(data.site_folder + '/.wordget.json', json_data, (err) => {
                // throws an error, you could also catch it here
                if (err) throw err;

                // success case, the file was saved
                console.log('Wordget - Saved Options');
                event.sender.send('result-wordget-update', 'success');
            });
        }
    });

    /* Setup and run the wordget command on the localmachinee to Pull the website locally */
    ipcMain.on('wordget-pull', (event, data) => {

        if (data.site_folder && data.wordget_folder && data.wordget_user && data.wordget_server) {
            //TODO: check if data.site_folder is actual folder on disk

            //normalize the local folder with trailing slash
            if (data.site_folder.charAt(data.site_folder.length - 1) != '/') {
                data.site_folder += '/';
            }
            //normalize the remote folder with trailing slash
            if (data.wordget_folder.charAt(data.wordget_folder.length - 1) != '/') {
                data.wordget_folder += '/';
            }

            let wordget_port = '';
            if (!data.wordget_port || data.wordget_port === undefined) {
                wordget_port = ' -p 22';
            } else {
                wordget_port = ' -p ' + data.wordget_port;
            }

            let wordget_extra_options = '';
            if (data.wordget_option_database)
                wordget_extra_options += ' -d localmode';
            if (data.wordget_option_uploads == false) {
                wordget_extra_options += ' -o localmode,exclude-uploads';
            } else {
                wordget_extra_options += ' -o localmode';
            }
            //run wordget and fetch site
            const cmd_wordget = 'cd ' + data.site_folder + ' && wordget -u ' + data.wordget_user + ' -h ' + data.wordget_server + wordget_port + ' -s ' + data.wordget_folder + ' -t ' + data.site_folder + wordget_extra_options;
            console.log('Wordget - Pull');
            console.log(cmd_wordget);
            event.sender.send('result-wordget-pull', 'success');

            //run the wordget command for the given folder
            if (data.wordget_option_files || data.wordget_option_database) {
                exec(cmd_wordget, { maxBuffer: 1024 * 500 }, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        event.sender.send('response-stdout', `${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        event.sender.send('response-stdout', `${stdout}`);
                        return;
                    }
                    event.sender.send('response-stdout', `${stdout}`);
                });
            }

        }
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