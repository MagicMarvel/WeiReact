export function deepClone(obj) {
  let weakMap = new WeakMap();

  function isObject(obj) {
    if ((obj !== null && typeof obj === "object") || typeof obj === "function")
      return true;
    else return false;
  }

  function clone(obj) {
    if (!isObject(obj)) return obj;

    if ([RegExp, Date].includes(obj.constructor))
      return new obj.constructor(obj);

    if (Array.isArray(obj)) {
      let result = [];
      for (let e of obj) {
        if (isObject(e)) result.push(clone(e));
        else result.push(e);
      }
      return result;
    }

    if (weakMap.has(obj)) {
      return weakMap.get(obj);
    }

    if (obj.constructor === Map) {
      let result = new Map();
      weakMap.set(obj, result);
      for (let e of obj) {
        if (isObject(e[1])) result.set(e[0], clone(e[1]));
        result.set(e[0], e[1]);
      }
      return result;
    }

    if (obj.constructor === Set) {
      let result = new Set();
      weakMap.set(obj, result);
      for (let e of obj) {
        if (isObject(e)) result.add(clone(e));
        result.add(e);
      }
      return result;
    }

    if (typeof obj === "function")
      return new Function("return " + obj.toString())();

    const keys = Reflect.ownKeys(obj);
    const desc = Object.getOwnPropertyDescriptors(obj);
    const result = Object.create(Object.getPrototypeOf(obj), desc);

    weakMap.set(obj, result);

    keys.forEach((e) => {
      if (isObject(obj[e])) result[e] = clone(obj[e]);
      else result[e] = obj[e];
    });
    return result;
  }
  return clone(obj);
}
