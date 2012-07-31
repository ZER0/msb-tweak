const  { data } = require("self");
const { PageMod } = require("page-mod");
const { storage } = require("simple-storage");
const { curry } = require("api-utils/functional");

function urltype (type, uri) {
  return [].concat(uri).map(function(item) data.url(item + "." + type));
}


let js = curry(urltype, "js");
let css = curry(urltype, "css");

function storeDraft(draft) {
  if (!draft)
    delete storage.draft;
  else
    storage.draft = draft;
}

PageMod({
  include: "http://benjamin.smedbergs.us/weekly-updates.fcgi/",
  contentStyleFile: css("content"),
  contentScriptFile: js(["utils", "content"]),
  contentScriptOptions: { draft : storage.draft },
  onAttach: function(worker) {
    worker.port.on("save-draft", storeDraft);
  }
})

