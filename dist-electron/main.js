import { app as l, BrowserWindow as n, Menu as r } from "electron";
import { fileURLToPath as p } from "node:url";
import o from "node:path";
const m = o.dirname(p(import.meta.url));
process.env.APP_ROOT = o.join(m, "..");
const t = process.env.VITE_DEV_SERVER_URL, d = o.join(process.env.APP_ROOT, "dist-electron"), s = o.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = t ? o.join(process.env.APP_ROOT, "public") : s;
let e;
function a() {
  e = new n({
    icon: o.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    title: "Pace Electron App",
    webPreferences: {
      preload: o.join(d, "preload.mjs")
    }
  }), e.setMenuBarVisibility(!0);
  const c = [
    {
      label: "File",
      submenu: [
        {
          label: "Exit",
          accelerator: "CmdOrCtrl+Q",
          click: () => {
            l.quit();
          }
        }
      ]
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectall" }
      ]
    },
    {
      label: "View",
      submenu: [
        {
          label: "Reload",
          accelerator: "CmdOrCtrl+R",
          click: () => {
            e == null || e.webContents.reload();
          }
        },
        {
          label: "Force Reload",
          accelerator: "CmdOrCtrl+Shift+R",
          click: () => {
            e == null || e.webContents.reloadIgnoringCache();
          }
        },
        {
          label: "Toggle Developer Tools",
          accelerator: "F12",
          click: () => {
            e == null || e.webContents.toggleDevTools();
          }
        },
        { type: "separator" },
        {
          label: "Toggle Theme",
          accelerator: "CmdOrCtrl+T",
          click: () => {
            console.log("Toggle Theme clicked"), e == null || e.webContents.send("toggle-theme");
          }
        },
        { type: "separator" },
        { role: "resetzoom" },
        { role: "zoomin" },
        { role: "zoomout" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "close" }
      ]
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About",
          click: () => {
          }
        }
      ]
    }
  ], i = r.buildFromTemplate(c);
  r.setApplicationMenu(i), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), t ? e.loadURL(t) : e.loadFile(o.join(s, "index.html"));
}
l.on("window-all-closed", () => {
  process.platform !== "darwin" && (l.quit(), e = null);
});
l.on("activate", () => {
  n.getAllWindows().length === 0 && a();
});
l.whenReady().then(() => {
  a();
});
export {
  d as MAIN_DIST,
  s as RENDERER_DIST,
  t as VITE_DEV_SERVER_URL
};
