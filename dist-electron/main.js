import { app as t, BrowserWindow as p, ipcMain as d, Menu as i } from "electron";
import { fileURLToPath as g } from "node:url";
import o from "node:path";
import l from "node:fs";
const T = o.dirname(g(import.meta.url));
process.env.APP_ROOT = o.join(T, "..");
const s = process.env.VITE_DEV_SERVER_URL, b = o.join(process.env.APP_ROOT, "dist-electron"), m = o.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = s ? o.join(process.env.APP_ROOT, "public") : m;
let e;
function u() {
  e = new p({
    icon: o.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    title: "Pace Electron App",
    webPreferences: {
      preload: o.join(b, "preload.mjs")
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
            t.quit();
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
  ], n = i.buildFromTemplate(r);
  i.setApplicationMenu(n), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), s ? e.loadURL(s) : e.loadFile(o.join(m, "index.html"));
}
t.on("window-all-closed", () => {
  process.platform !== "darwin" && (t.quit(), e = null);
});
t.on("activate", () => {
  p.getAllWindows().length === 0 && u();
});
const a = o.join(t.getPath("userData"), "pace-data.json");
d.handle("save-data", async (r, n) => {
  try {
    return l.writeFileSync(a, JSON.stringify(n, null, 2)), { success: !0 };
  } catch (c) {
    return console.error("Error saving data:", c), { success: !1, error: c.message };
  }
});
d.handle("load-data", async () => {
  try {
    if (l.existsSync(a)) {
      const r = l.readFileSync(a, "utf-8");
      return JSON.parse(r);
    } else
      return {
        people: [],
        circles: [],
        groups: [],
        checkins: [],
        actionItems: [],
        tags: [],
        covenantTypes: [],
        personTags: [],
        personGroups: [],
        personCircles: [],
        personCovenantTypes: [],
        checkinTags: [],
        actionItemTags: [],
        checkinCovenantTypes: []
      };
  } catch (r) {
    return console.error("Error loading data:", r), {
      people: [],
      circles: [],
      groups: [],
      checkins: [],
      actionItems: [],
      tags: [],
      covenantTypes: [],
      personTags: [],
      personGroups: [],
      personCircles: [],
      personCovenantTypes: [],
      checkinTags: [],
      actionItemTags: [],
      checkinCovenantTypes: []
    };
  }
});
t.whenReady().then(() => {
  u();
});
export {
  b as MAIN_DIST,
  m as RENDERER_DIST,
  s as VITE_DEV_SERVER_URL
};
