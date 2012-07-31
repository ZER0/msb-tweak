function prettyDate(time, now){
  now = now || Date.now();

  var date = new Date(time);
  var diff = (now - date.getTime()) / 1000;
  var day_diff = Math.floor(diff / 86400);

  if ( isNaN(day_diff) || day_diff < 0)
    return null;

  return day_diff == 0 && (
    diff < 60 && "just now" ||
    diff < 120 && "1 min ago" ||
    diff < 3600 && Math.floor( diff / 60 ) + " mins ago" ||
    diff < 7200 && "1 hour ago" ||
    diff < 86400 && Math.floor( diff / 3600 ) + " hours ago"
  ) ||
    day_diff == 1 && "Yesterday ago" ||
    day_diff < 7 && day_diff + " days ago" ||
    day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago" ||
    day_diff < 365 && Math.ceil( day_diff / 31 ) + " months ago" ||
    day_diff > 364 && Math.ceil( day_diff / 365 ) + " years ago"
};

/**
 * Curries a function with the arguments given.
 *
 * @param {Function} fn
 *    The function to curry
 *
 * @returns The function curried
 */
function curry(fn) {
  if (typeof fn !== "function")
    throw new TypeError(String(fn) + " is not a function");

  let args = Array.slice(arguments, 1);

  return function() fn.apply(this, args.concat(Array.slice(arguments)));
}


/**
 * Returns a new namespace, function that may can be used to access an
 * namespaced object of the argument argument. Namespaced object are associated
 * with owner objects via weak references. Namespaced objects inherit from the
 * owners ancestor namespaced object. If owner's ancestor is `null` then
 * namespaced object inherits from given `prototype`. Namespaces can be used
 * to define internal APIs that can be shared via enclosing `namespace`
 * function.
 * @examples
 *    const internals = ns();
 *    internals(object).secret = secret;
 */
function ns() {
  const map = new WeakMap();
  return function namespace(target) {
    if (!target)        // If `target` is not an object return `target` itself.
      return target;
    // If target has no namespaced object yet, create one that inherits from
    // the target prototype's namespaced object.
    if (!map.has(target))
      map.set(target, Object.create(namespace(Object.prototypeOf(target) || null)));

    return map.get(target);
  };
};

/**
 * Creates typing events
 */
!function() {
  let typingTimer = null;
  let typingTarget = null;

  function stopTyping() {
    if (typingTarget) {
      let typingEvent = document.createEvent("CustomEvent");
      typingEvent.initCustomEvent("typingstop", true, true, null);

      typingTarget.dispatchEvent(typingEvent);
    }

    typingTimer = null;
    typingTarget = null;
  }

  document.addEventListener("input", function(event) {

    if (typingTimer) {
      clearTimeout(typingTimer);
    } else {
      let typingEvent = document.createEvent("CustomEvent");
      typingEvent.initCustomEvent("typingstart", true, true, null);

      typingTarget = event.target;
      typingTarget.dispatchEvent(typingEvent);
    }

    typingTimer = setTimeout(stopTyping, 500);
  });
}();
