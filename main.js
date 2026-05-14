// main.js
const { app, BrowserWindow } = require("electron");
const path = require("path");

// Use a safe path for server folder after packaging
const server = require(path.join(__dirname, "server", "server.js"));
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "logo.ico"), // your exe icon
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  console.log("Waiting for backend...");

  const interval = setInterval(() => {
    // Wait until server signals it is ready
    if (server.isReady && server.isReady()) {
      clearInterval(interval);
      console.log("Backend ready ✅ Loading frontend...");

      const indexPath = path.join(
        __dirname,
        "finance-frontend",
        "build",
        "index.html"
      );

      mainWindow.loadFile(indexPath);
    }
  }, 100);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});