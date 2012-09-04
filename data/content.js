//- Testing bug 737003 on Page-Mod

let Draft = {
  data: null,

  display: function (form, label) {
    let { data } = Draft;

    if (!data) {
      if (label)
        label.textContent = "";

      return;
    }

    if (form) {
      let { elements } = form;

      elements.completed.value = data.completed;
      elements.planned.value = data.planned;
      elements.tags.value = data.tags;
    }

    if (label) {
      label.textContent = "Draft saved " + prettyDate(data.time);
    }
  },

  save: function (form) {
    let { elements } = form;

    let completed = elements.completed.value.trim();
    let planned = elements.planned.value.trim();
    let tags = elements.tags.value.trim();

    let isEmpty = completed.length + planned.length + tags.length === 0;

    if (isEmpty) {
      Draft.discard();
      return;
    }

    Draft.data = {
      time: Date.now(),
      completed: completed,
      planned: planned,
      tags: tags
    }

    self.port.emit("save-draft", Draft.data);
  },

  discard: function() {
    Draft.data = null;
    self.port.emit("save-draft", null);
  }
}

function main(draft) {

  Draft.data = draft;

  let submit = document.querySelector("div.fullwidth p input[type=submit]");
  let timer = null;

  function updateSubmit() {
    submit.disabled = submit.form.elements.completed.value.trim() === "";
  }

  function updateLabel() {
    Draft.display(null, label);
  }

  if (!submit)
    return;

  let label = document.getElementById("msb-tweak-draft");
  let { form } = submit;

  submit.parentNode.appendChild(label);

  Draft.display(form, label);

  updateSubmit();

  form.addEventListener("typingstart", function() {
    label.className = "typing";

    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    label.textContent = "typing...";
  });

  form.addEventListener("typingstop", function() {
    label.className = "";

    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    timer = setInterval(updateLabel, 500);

    Draft.save(this);
    Draft.display(null, label);
  });

  form.addEventListener("input", updateSubmit);
  form.addEventListener("submit", Draft.discard);
}

self.port.on("init", main);