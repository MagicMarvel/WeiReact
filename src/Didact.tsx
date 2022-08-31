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
}

type Fiber = FiberInformation & ElementInformation;

let workInProgressRoot: Fiber;
let nextUnitOfWork: Fiber;
let hookIndex = -1;

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
function render(element: ElementInformation, container: HTMLElement) {
  workInProgressRoot = {
    ...element,
    dom: null,
    child: null,
    silbing: null,
    parent: {
      child: null,
      dom: container,
      parent: null,
      props: null,
      silbing: null,
      type: "div",
    },
  };
  workInProgressRoot.parent.child = workInProgressRoot;
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
      fiber: FiberInformation & HTMLElementInformation
    ) {
      let isFirstChild = true;
      let lastChild = null;
      fiber.props.children.forEach((child) => {
        const newFiber: Fiber = {
          ...child,
          dom: null,
          child: null,
          silbing: null,
          parent: null,
        };
        if (isFirstChild) {
          fiber.child = newFiber;
          newFiber.parent = fiber;
          lastChild = newFiber;
        } else {
          lastChild.silbing = newFiber;
          lastChild = newFiber;
          newFiber.parent = fiber;
        }
        isFirstChild = false;
      });
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

    function commitRoot(root: Fiber) {
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
          now.parent.dom.appendChild(fiber.dom);
          commitWork(findNextWorkInProgressFiber(fiber));
        }
      }

      const nodes = container.childNodes;
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        container.removeChild(node);
      }
      commitWork(root);
    }

    if (deadline.timeRemaining() > 10 && nextUnitOfWork != null) {
      // 处理类似div、"Hello world!"这种节点
      const dealingHostComponent = (
        nextUnitOfWork:
          | (HTMLElementInformation | TextElementInformation) & FiberInformation
      ) => {
        nextUnitOfWork.dom = createDom(nextUnitOfWork);

        if (!isTextElementInformation(nextUnitOfWork))
          createChildrenFiber(nextUnitOfWork);
      };

      // 处理类似App这种函数式组件节点
      const dealingFunctionComponent = () => {
        if (typeof nextUnitOfWork.type != "function") {
          throw new Error(
            "进入dealingFunctionComponent的时候,这个节点不是一个function节点"
          );
        }

        hookIndex = -1;
        // 如果是函数式组件，直接运行该函数(利用createElement函数生成 ElementInformation 树)
        // nextUnitOfWork.type即是该函数
        const elementInformation = nextUnitOfWork.type(nextUnitOfWork.props);

        // 函数式组件不用生成 DOM节点，直接生成 fiber即可
        const newFiber: Fiber = {
          ...elementInformation,
          dom: null,
          child: null,
          parent: nextUnitOfWork,
          silbing: null,
        };
        nextUnitOfWork.child = newFiber;
      };

      if (
        isHTMLElementInformation(nextUnitOfWork) ||
        isTextElementInformation(nextUnitOfWork)
      )
        dealingHostComponent(nextUnitOfWork);
      else dealingFunctionComponent();
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
    nextUnitOfWork = workInProgressRoot;
  }
  return [workInProgressFiber.hooks[hookIndex].state, setState];
}

export const WeiReact = { createElement, render };
export { useState };
