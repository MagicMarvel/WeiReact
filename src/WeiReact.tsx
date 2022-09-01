import { deepClone } from "./deepClone";

interface HTMLElementInformation {
  //标签名
  type: keyof HTMLElementTagNameMap;
  props: {
    //属性
    [key: string]: any;
    //子元素
    children: ElementInformation[];
  };
}

let isHTMLElementInformation = (x: any): x is HTMLElementInformation => {
  return (
    !isTextElementInformation(x) &&
    typeof (x as HTMLElementInformation).type != "function"
  );
};

let isFunctionComponentInformation = (
  x: any
): x is FunctionComponentInformation => {
  return typeof (x as FunctionComponentInformation).type == "function";
};

interface TextElementInformation {
  type: "TEXT_ELEMENT";
  props: {
    nodeValue: string;
  };
}
let isTextElementInformation = (x: any): x is TextElementInformation => {
  return (x as TextElementInformation).type == "TEXT_ELEMENT";
};

interface FunctionComponentInformation {
  type: (props: any) => ElementInformation;
  props: Object;
  hooks: { state: any; actions: ((state: any) => any)[] }[];
}

type ElementInformation =
  | HTMLElementInformation
  | TextElementInformation
  | FunctionComponentInformation;

interface FiberInformation {
  dom: HTMLElement | Text;
  child: Fiber;
  silbing: Fiber;
  parent: Fiber;
  alternate: Fiber;
  effectTag: "PLACEMENT" | "MODIFY";
}

type Fiber = FiberInformation & ElementInformation;

let workInProgressRoot: HTMLElementInformation & FiberInformation;
let nextUnitOfWork: Fiber;
let hookIndex = -1;
let deletions: Fiber[] = [];
let container: HTMLElement = null;
let currentRoot: HTMLElementInformation & FiberInformation = null;

/**
 * 创建ElementInformation树
 * @param type 普通标签或者函数
 * @param props 普通标签的属性/函数组件的参数
 * @param children 子元素
 * @returns ElementInformation
 */
function createElement(
  type: keyof HTMLElementTagNameMap | ((props: any) => ElementInformation),
  props: Object,
  ...children: (ElementInformation | string | number)[]
): ElementInformation {
  if (typeof type == "function")
    return {
      type,
      props,
      hooks: [],
    };

  return {
    type,
    props: {
      ...props,
      children: children
        ? children.map((child) => {
            if (typeof child === "string") {
              return {
                type: "TEXT_ELEMENT",
                props: { nodeValue: child },
              };
            }
            if (typeof child === "number") {
              return {
                type: "TEXT_ELEMENT",
                props: {
                  nodeValue: child.toString(),
                },
              };
            }
            return child;
          })
        : [],
    },
  };
}

/**
 * 将元素渲染到容器上
 * @param element 要渲染上去的元素的信息
 * @param container 要渲染到的容器
 */
function render(element: ElementInformation, container_: HTMLElement) {
  container = container_;
  workInProgressRoot = {
    type: "div",
    props: {
      children: [element],
    },
    alternate: null,
    dom: container,
    child: null,
    effectTag: "MODIFY",
    parent: null,
    silbing: null,
  };
  nextUnitOfWork = workInProgressRoot;

  /**
   * 普通标签：
   * 1.创建DOM元素
   * 2.生成子元素的fiber
   * 3.查找下一个fiber
   *
   * 函数式组件：
   * 1.运行它，得到ElementInformation
   * 2.根据ElementInformation生成一个fiber
   * 3.查找下一个fiber
   * @param deadline 剩余时间
   */
  function wookLoop(deadline: IdleDeadline): void {
    /**
     * 创建DOM
     * @param element 要渲染上去的元素的信息
     * @returns dom元素
     */
    function createDom(
      element: HTMLElementInformation | TextElementInformation
    ): HTMLElement | Text {
      // let dom: HTMLElement | Text;
      if (isTextElementInformation(element)) {
        return document.createTextNode(element.props.nodeValue);
      } else {
        let dom = document.createElement(element.type);
        // .keys 是把属性提取出来
        Object.keys(element.props)
          .filter((key) => key != "children")
          .forEach((key) => {
            const value = element.props[key];
            if (key.startsWith("on")) {
              dom.addEventListener(key.substring(2).toLowerCase(), value);
            } else {
              dom.setAttribute(key, value);
            }
          });
        return dom;
      }
    }

    /**
     * 创建子元素的fiber
     * @param fiber 要被创建fiber的元素的父元素fiber
     */
    function createChildrenFiber(
      fiber: FiberInformation &
        (HTMLElementInformation | FunctionComponentInformation),
      children: ElementInformation[]
    ) {
      let isFirstChild = true;
      let lastSibling = null;

      let oldFiber = fiber.alternate && fiber.alternate.child;
      let index = 0;

      while (index < children.length || oldFiber) {
        let elementInformation = children[index];

        let newFiber: Fiber;
        if (elementInformation && oldFiber) {
          const sameType = elementInformation.type == oldFiber.type;
          if (!sameType) {
            deletions.push(oldFiber);
            newFiber = {
              effectTag: "PLACEMENT",
              ...elementInformation,
              dom: null,
              alternate: null,
              child: null,
              silbing: null,
              parent: null,
            };
          }

          if (sameType) {
            newFiber = {
              effectTag: "MODIFY",
              ...elementInformation,
              dom: oldFiber.dom,
              alternate: oldFiber,
              child: null,
              silbing: null,
              parent: null,
            };
          }
        }
        // 孩子节点比之前的少
        if (!elementInformation && oldFiber) {
          deletions.push(oldFiber);
        }

        // 孩子节点比之前的多
        if (elementInformation && !oldFiber) {
          newFiber = {
            effectTag: "PLACEMENT",
            ...elementInformation,
            dom: null,
            alternate: null,
            child: null,
            silbing: null,
            parent: null,
          };
        }

        if (isFirstChild) {
          fiber.child = newFiber;
          newFiber.parent = fiber;
          lastSibling = newFiber;
        } else {
          lastSibling.silbing = newFiber;
          lastSibling = newFiber;
          newFiber.parent = fiber;
        }

        isFirstChild = false;

        oldFiber = oldFiber && oldFiber.silbing;
        index++;
      }
    }

    /**
     * 找到下一个要渲染的fiber
     * @param nextUnitOfWork 当前正在渲染的fiber
     */
    function findNextWorkInProgressFiber(nextUnitOfWork: Fiber): Fiber {
      //如果有儿子，先访问儿子
      if (nextUnitOfWork.child) {
        return nextUnitOfWork.child;
      } else if (nextUnitOfWork.silbing) {
        return nextUnitOfWork.silbing;
      }
      //如果没有儿子，就一直往上找有兄弟的爸爸
      else {
        let now = nextUnitOfWork;
        while (now.parent) {
          if (now.parent.silbing) return now.parent.silbing;
          else now = now.parent;
        }
        return null;
      }
    }

    function commitRoot(root: HTMLElementInformation & FiberInformation) {
      function updateDom(
        dom: HTMLElement | Text,
        oldProps: any,
        newProps: any
      ) {
        function isHTMLElement(x: any): x is HTMLElement {
          return (x as HTMLElement).setAttribute != null;
        }

        if (isHTMLElement(dom)) {
          const keys = [
            ...Object.keys(oldProps),
            ...Object.keys(newProps),
          ].filter((key) => key != "children");
          keys.forEach((key) => {
            if (newProps[key]) {
              if (key.startsWith("on")) {
                if (oldProps[key]) {
                  dom.removeEventListener(
                    key.substring(2).toLowerCase(),
                    oldProps[key]
                  );
                }
                dom.addEventListener(
                  key.substring(2).toLowerCase(),
                  newProps[key]
                );
              }

              if (!key.startsWith("on")) {
                dom.setAttribute(key, newProps[key]);
              }
            } else {
              if (key.startsWith("on")) {
                dom.removeEventListener(
                  key.substring(2).toLowerCase(),
                  oldProps[key]
                );
              }
              if (!key.startsWith("on")) {
                dom.removeAttribute(key);
              }
            }
          });
        }
        if (!isHTMLElement(dom)) {
          dom.nodeValue = newProps.nodeValue;
        }
      }
      function commitWork(fiber: Fiber) {
        if (fiber == null) return;
        if (!fiber.dom) {
          commitWork(findNextWorkInProgressFiber(fiber));
        } else {
          let now = fiber;
          while (!now.parent.dom) {
            now = now.parent;
            break;
          }
          if (fiber.effectTag == "PLACEMENT")
            now.parent.dom.appendChild(fiber.dom);
          if (
            fiber.effectTag == "MODIFY" &&
            (isHTMLElementInformation(fiber) || isTextElementInformation(fiber))
          ) {
            updateDom(fiber.dom, fiber.alternate.props, fiber.props);
          }
          commitWork(findNextWorkInProgressFiber(fiber));
        }
      }

      if (deletions) {
        deletions.forEach((fiber: Fiber) => {
          let parent = fiber.parent;
          while (!parent.dom) {
            parent = parent.parent;
          }
          parent.dom.removeChild(fiber.dom);
        });
        deletions = [];
      }
      commitWork(root.child);
      currentRoot = root;
    }

    // 处理类似App这种函数式组件节点
    function dealingFunctionComponent(
      nextUnitOfWork: FunctionComponentInformation & FiberInformation
    ) {
      if (isFunctionComponentInformation(nextUnitOfWork)) {
        hookIndex = -1;
        // 如果是函数式组件，直接运行该函数(利用createElement函数生成 ElementInformation 树)
        // nextUnitOfWork.type即是该函数
        const elementInformation = nextUnitOfWork.type(nextUnitOfWork.props);
        createChildrenFiber(nextUnitOfWork, [elementInformation]);
      }
    }

    // 处理类似div、"Hello world!"这种节点
    function dealingHostComponent(
      nextUnitOfWork:
        | (HTMLElementInformation | TextElementInformation) & FiberInformation
    ) {
      if (nextUnitOfWork.effectTag == "PLACEMENT")
        nextUnitOfWork.dom = createDom(nextUnitOfWork);

      if (!isTextElementInformation(nextUnitOfWork)) {
        createChildrenFiber(nextUnitOfWork, nextUnitOfWork.props.children);
      }
    }

    if (deadline.timeRemaining() > 1 && nextUnitOfWork != null) {
      if (
        isHTMLElementInformation(nextUnitOfWork) ||
        isTextElementInformation(nextUnitOfWork)
      ) {
        dealingHostComponent(nextUnitOfWork);
      } else dealingFunctionComponent(nextUnitOfWork);
      nextUnitOfWork = findNextWorkInProgressFiber(nextUnitOfWork);

      // fiber树已经创建完成了，就开始把 DOM 一个一个 append 上去
      if (nextUnitOfWork == null) {
        commitRoot(workInProgressRoot);
      }
    }
    requestIdleCallback(wookLoop);
  }
  requestIdleCallback(wookLoop);
}

function useState(initial: any) {
  if (!isFunctionComponentInformation(nextUnitOfWork)) {
    throw new Error("");
  }

  hookIndex += 1;

  let workInProgressFiber = nextUnitOfWork;
  let index = hookIndex;

  if (nextUnitOfWork.hooks.length - 1 >= hookIndex) {
    // 非第一次调用这个useState
    workInProgressFiber.hooks[hookIndex].actions.forEach((fn) => {
      workInProgressFiber.hooks[hookIndex].state = fn(
        workInProgressFiber.hooks[hookIndex].state
      );
    });
    workInProgressFiber.hooks[hookIndex].actions = [];
  } else {
    // 第一次调用useState
    workInProgressFiber.hooks.push({
      state: initial,
      actions: [],
    });
  }

  function setState(actionOrValue: ((state: any) => any) | any) {
    if (!(actionOrValue instanceof Function)) {
      workInProgressFiber.hooks[index].actions.push((state: any) => {
        return actionOrValue;
      });
    } else {
      workInProgressFiber.hooks[index].actions.push(actionOrValue);
    }

    if (currentRoot.child) {
      nextUnitOfWork = {
        type: "div",
        dom: container,
        child: null,
        effectTag: "MODIFY",
        parent: null,
        silbing: null,
        props: currentRoot.props,
        alternate: currentRoot,
      };
      // FIXME
      workInProgressRoot = nextUnitOfWork;
    }
  }
  return [workInProgressFiber.hooks[hookIndex].state, setState];
}

export const WeiReact = { createElement, render };
export { useState };
