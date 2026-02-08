import { app as l, BrowserWindow as p, ipcMain as s, Menu as c } from "electron";
import { fileURLToPath as b } from "node:url";
import o from "node:path";
import i from "node:fs/promises";
const g = o.dirname(b(import.meta.url));
process.env.APP_ROOT = o.join(g, "..");
const a = process.env.VITE_DEV_SERVER_URL, T = o.join(process.env.APP_ROOT, "dist-electron"), m = o.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = a ? o.join(process.env.APP_ROOT, "public") : m;
const d = o.join(l.getPath("userData"), "pace-data.json");
let e;
function u() {
  e = new p({
    icon: o.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    title: "Pace Electron App",
    webPreferences: {
      preload: o.join(T, "preload.mjs")
    }
  }), e.setMenuBarVisibility(!0);
  const r = [
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
  ], t = c.buildFromTemplate(r);
  c.setApplicationMenu(t), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), a ? e.loadURL(a) : e.loadFile(o.join(m, "index.html"));
}
l.on("window-all-closed", () => {
  process.platform !== "darwin" && (l.quit(), e = null);
});
l.on("activate", () => {
  p.getAllWindows().length === 0 && u();
});
l.whenReady().then(() => {
  u(), s.handle("save-data", async (r, t) => {
    try {
      return await i.writeFile(d, JSON.stringify(t, null, 2)), { success: !0 };
    } catch (n) {
      return console.error("Error saving data:", n), { success: !1, error: n.message };
    }
  }), s.handle("load-data", async () => {
    try {
      const r = await i.readFile(d, "utf8");
      return JSON.parse(r);
    } catch (r) {
      return r.code === "ENOENT" ? [] : (console.error("Error loading data:", r), []);
    }
  });
});
export {
  T as MAIN_DIST,
  m as RENDERER_DIST,
  a as VITE_DEV_SERVER_URL
};
