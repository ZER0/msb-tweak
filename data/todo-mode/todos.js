;(function() {
  "use strict";

  let todos = [];
  let whatsNew = document.getElementById("msb-tweak-whats-new");
  let modeSwitch = document.getElementById("msb-tweak-todo-switch");

  let { form } = whatsNew;

  whatsNew.addEventListener("keypress", function (event) {
    if ( event.keyCode === event.DOM_VK_RETURN ) {
      addTodo(this.value);

      event.preventDefault();
      event.stopPropagation();
    }
  });

  modeSwitch.addEventListener("change", function (event) {
    todoMode(this.checked);
  });

  function todoMode(isEnabled) {
    let section = document.getElementById("msb-tweak-todo");
    let h3s = section.parentNode.querySelectorAll("h3");
    let label = document.getElementById("msb-tweak-draft");
    let textStyle, todoStyle;

    if (isEnabled) {
      loadTodos();
      redrawTodosUI();

      textStyle = "none";
      todoStyle = "block";
    } else {
      textStyle = "";
      todoStyle = "none";
    }

    label.style.display =
    h3s[0].style.display = 
    h3s[0].nextElementSibling.style.display = 
    h3s[1].style.display = 
    h3s[1].nextElementSibling.style.display = textStyle;

    section.style.display = todoStyle;

    self.port.emit("todo-mode", isEnabled);
  }

  function format(value) {
    return value
      .replace(/`([\S]+)`/g, "<code>$1</code>")
      .replace(/bug (\d+)/g, "<a href='https://bugzilla.mozilla.org/show_bug.cgi?id=$1' target='_blank'>bug $1</a>")
  }

  function editHandler (event) {
    let text = this.value.trim();
    let li = this.parentNode;
    let index = li.dataset.todoIndex;

    if (event.type === "blur" || event.keyCode === event.DOM_VK_RETURN) {

      if (text) {
        todos[index].title = text;

        li.className = "";
        li.querySelector("label").innerHTML = format(text);
      } else {
        todos[index] = undefined;

        // trick to keep the events firing
        li.style.display = "none";

        setTimeout(function(){
          li.parentNode.removeChild(li);
        }, 1000)
      }

      event.preventDefault();
      event.stopPropagation();
    }

    saveTodos();
    //load();
  }

  function changeStatus() {
    let index = this.parentNode.parentNode.dataset.todoIndex;

    todos[index].completed = this.checked;

    refreshData();
  }


  function todoContentHandler( event ) {
    let div = this.parentNode;
    let input = div.nextElementSibling;

    div.parentNode.className = "editing";
    input.select();
    input.focus();
  }

  function loadTodos() {
    todos = [];
    let doneText = form.elements.completed.value;
    let nextText = form.elements.planned.value;
    let re = /^\s*-\s+/m;

    let items = nextText.split(/^- /m);

    for (let i = 1, item; item = items[i++];) {
      let text = item.replace(/\n/g, " ").trim();
      todos.push({title: text, completed: false});
    }

    items = doneText.split(/^- /m);

    for (let i = 1, item; item = items[i++];) {
      let text = item.replace(/\n/g, " ").trim();
      todos.push({title: text, completed: true});
    }
  }

  function saveTodos() {
    let doneText = "", nextText = "";

    for (let todo of todos) {
      if (!todo) continue;

      if (todo.completed)
        doneText += "- " + todo.title + "\n";
      else     
        nextText += "- " + todo.title + "\n";
    }

    form.elements.completed.value = doneText;
    form.elements.planned.value = nextText;

    let submit = form.querySelector("input[type=submit]");
    submit.disabled = submit.form.elements.completed.value.trim() === "";
    
    Draft.save(form);
  
    updateStats()
  }

  function addTodo(text) {
    text = text.trim();

    if (text) {
      todos.push({ title: text, completed: false });
      refreshData();
    }
  }

  function refreshData() {
    saveTodos();

    redrawTodosUI();
  }

  function updateStats() {
    let total = todos.filter(Boolean).length;
    let completed = 0;

    for (let todo of todos) {
      if (!todo) continue;

      completed += todo.completed ? 1 : 0;
    }
    let left = total - completed;

    let itemCount = document.getElementById("msb-tweak-item-count");
    let footer = itemCount.parentNode;

    if (!total) {
      footer.style.display = "none";
      return;
    }

    footer.style.display = "block";

    itemCount.firstElementChild.textContent = left;

    itemCount.lastChild.nodeValue = (left === 1 ? "item" : "items") + " left";

  }


  function redrawTodosUI() {

    let ul = document.getElementById('msb-tweak-todo-list');

    let liClone = document.getElementById("template:msb-tweak-item")
      .firstElementChild;

    ul.innerHTML = '';
    document.getElementById('msb-tweak-whats-new').value = '';

    for (let i = 0, l = todos.length; i < l; i++ ) {
      let todo = todos[i];

      if (!todo) continue;

      let li = liClone.cloneNode(true);

      // set the `dataset` property causes some error on content-proxy
      // needs to investigate more about it
      li.setAttribute("data-todo-index", i);

      let checkbox = li.querySelector("input[type=checkbox]");
      checkbox.addEventListener( "change", changeStatus);

      let label = li.querySelector("label");
      label.innerHTML = format(todo.title);
      label.addEventListener( "dblclick", todoContentHandler);

      let input = li.querySelector(".edit");
      input.value = todo.title;
      input.addEventListener("keypress", editHandler);
      input.addEventListener("blur", editHandler);

      if (todo.completed) {
        li.classList.add("complete");
        checkbox.checked = true;
      }

      ul.appendChild(li);
    }
  }

  loadTodos();
  refreshData();

  self.port.on("init", function(draft, isTodoMode) {
    modeSwitch.checked = isTodoMode;
    todoMode(isTodoMode)
  })

})();