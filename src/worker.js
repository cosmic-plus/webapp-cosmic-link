"use_strict"

const ServiceWorker = require("@cosmic-plus/jsutils/service-worker")
const pkg = require("../package.json")

new ServiceWorker(pkg.name, pkg.version, "verbose")
  .fromCache([
    "/",
    "cosmic-lib.css",
    "index.html",
    "ledger.js",
    "main.css",
    "main.js",
    "stellar-sdk.js",
    "icons/512x512.png",
  ])
  .precache()
  .register()