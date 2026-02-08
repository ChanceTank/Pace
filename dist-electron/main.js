import { app as l, BrowserWindow as m, ipcMain as c, dialog as u, Menu as d } from "electron";
import { fileURLToPath as h } from "node:url";
import o from "node:path";
import n from "node:fs/promises";
const C = o.dirname(h(import.meta.url));
process.env.APP_ROOT = o.join(C, "..");
const i = process.env.VITE_DEV_SERVER_URL, E = o.join(process.env.APP_ROOT, "dist-electron"), b = o.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = i ? o.join(process.env.APP_ROOT, "public") : b;
const p = o.join(l.getPath("userData"), "pace-data.json");
let e;
function g() {
  e = new m({
    icon: o.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    title: "Pace Electron App",
    webPreferences: {
      preload: o.join(E, "preload.mjs")
    }
  }), e.setMenuBarVisibility(!0);
  const r = [
    {
      label: "File",
      submenu: [
        {
          label: "Import",
          accelerator: "CmdOrCtrl+I",
          click: async () => {
            const t = await u.showOpenDialog(e, {
              properties: ["openFile"],
              filters: [{ name: "JSON", extensions: ["json"] }]
            });
            if (!t.canceled)
              try {
                const s = await n.readFile(t.filePaths[0], "utf8"), f = JSON.parse(s);
                e == null || e.webContents.send("set-todos", f);
              } catch (s) {
                console.error("Error importing data:", s);
              }
          }
        },
        {
          label: "Export",
          accelerator: "CmdOrCtrl+E",
          click: async () => {
            e == null || e.webContents.send("get-todos");
          }
        },
        { type: "separator" },
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
  ], a = d.buildFromTemplate(r);
  d.setApplicationMenu(a), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), i ? e.loadURL(i) : e.loadFile(o.join(b, "index.html"));
}
l.on("window-all-closed", () => {
  process.platform !== "darwin" && (l.quit(), e = null);
});
l.on("activate", () => {
  m.getAllWindows().length === 0 && g();
});
l.whenReady().then(() => {
  g(), c.handle("save-data", async (r, a) => {
    try {
      return await n.writeFile(p, JSON.stringify(a, null, 2)), { success: !0 };
    } catch (t) {
      return console.error("Error saving data:", t), { success: !1, error: t.message };
    }
  }), c.handle("load-data", async () => {
    try {
      const r = await n.readFile(p, "utf8");
      return JSON.parse(r);
    } catch (r) {
      return r.code === "ENOENT" ? [] : (console.error("Error loading data:", r), []);
    }
  }), c.on("export-todos", async (r, a) => {
    const t = await u.showSaveDialog(e, {
      filters: [{ name: "JSON", extensions: ["json"] }]
    });
    if (!t.canceled)
      try {
        await n.writeFile(t.filePath, JSON.stringify(a, null, 2));
      } catch (s) {
        console.error("Error exporting todos:", s);
      }
    e == null || e.webContents.send("export-done");
  });
});
export {
  E as MAIN_DIST,
  b as RENDERER_DIST,
  i as VITE_DEV_SERVER_URL
};
