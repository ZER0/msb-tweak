const  { data } = require("self");
const { PageMod } = require("page-mod");
const { storage } = require("simple-storage");
const { curry } = require("api-utils/functional");

function urltype (type, uri) {
  let args = Array.slice(arguments ,1);
  return args.map(function(item) data.url(item + "." + type));
}

let js = curry(urltype, "js");
let css = curry(urltype, "css");

function storeDraft(draft) {
  storage.draft = draft;
}

function storeMode(isTodoMode) {
  delete storage.todoModeEanbled
  storage.todoModeEnabled = isTodoMode;
}

PageMod({
  include: "http://benjamin.smedbergs.us/weekly-updates.fcgi/",
  contentStyleFile: css("content", "todo-mode/todos"),

  contentScriptFile: js("overlay", "utils", "content", "todo-mode/todos"),

  contentScriptOptions: {"overlay" : data.load("overlay.html") },

  onAttach: function(worker) {
    let { emit, on } = worker.port;

    on("save-draft", storeDraft);
    on("todo-mode", storeMode);
    emit("init", storage.draft, storage.todoModeEnabled );
  }
})

