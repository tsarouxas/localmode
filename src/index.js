import { app, BrowserWindow,ipcMain,shell } from 'electron';
const os = require('os-utils');
const { exec } = require('child_process');
const { spawn } = require('child_process');


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
      mainWindow.webContents.send('main-ping','asdda');
      //mainWindow.webContents.send('main-ping',`${stdout}`);
  }
}



/* START INIT*/
const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 680,
    webPreferences:{
      nodeIntegration: true
    },
    /* resizable: false, */
    frame: false,
    titleBarStyle: 'hidden'
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

//INIT - Start the game
 // setInterval(() => {

    os.cpuUsage(function(v){
      //console.log('cpu',v*100);
      mainWindow.webContents.send('cpu',v*100);
    });


  //},1000);

  //console.log(ipcMain);
  ipcMain.on('cpu',(event,data) => {
    console.log('cpu % ' + data);
    
  });

  ipcMain.on('runCommand', async (event, arg) => {
    event.returnValue = await exec('ls -al', shell_callback);
  });

// Event handler for asynchronous incoming messages
ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg)
  // Event emitter for sending asynchronous messages

//Get a list of all websites on localhost
//let res = exec('ls -al', shell_callback);
const child = spawn('pwd');
//const child = spawn('find', ['.', '-type', 'f']);

child.stdout.on('data', (data) => {
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

