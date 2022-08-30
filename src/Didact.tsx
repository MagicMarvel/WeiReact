type ElementInformation =
  | {
      //标签名
      type: keyof HTMLElementTagNameMap;
      props: {
        //属性
        [key: string]: any;
        //子元素
        children: ElementInformation[];
      };
    }
  | {
      type: "TEXT_ELEMENT";
      props: {
        nodeValue: string;
      };
    }
  | {
      type: (props: any) => ElementInformation;
      props: Object;
    };

type Fiber = {
  dom: HTMLElement | Text;
  child: Fiber;
  silbing: Fiber;
  parent: Fiber;
} & ElementInformation;

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
  ...children: (ElementInformation | string)[]
): ElementInformation {
  if (typeof type == "function")
    return {
      type,
      props,
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
  let workInProgressRoot: Fiber = {
    type: element.type,
    props: element.props,
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
  } as Fiber;
  workInProgressRoot.parent.child = workInProgressRoot;
  let nextUnitOfWork = workInProgressRoot;

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
    function createDom(element: ElementInformation): HTMLElement | Text {
      // 函数式节点没有dom
      if (typeof element.type == "function") {
        throw new Error("传入function节点到createDom函数里面");
      }
      let dom: HTMLElement | Text;
      if (element.type == "TEXT_ELEMENT") {
        dom = document.createTextNode(element.props.nodeValue);
      } else {
        dom = document.createElement(element.type);
        // .keys 是把属性提取出来
        Object.keys(element.props)
          .filter((key) => key != "children")
          .forEach((key) => {
            const value = element.props[key];
            if (key.startsWith("on")) {
              (dom as HTMLElement).addEventListener(
                key.substring(2).toLowerCase(),
                value
              );
            } else {
              (dom as HTMLElement).setAttribute(key, value);
            }
          });
      }
      return dom;
    }

    /**
     * 创建子元素的fiber
     * @param fiber 要被创建fiber的元素的父元素fiber
     */
    function createChildrenFiber(fiber: Fiber) {
      if (typeof fiber.type == "function") {
        throw new Error("传入function函数到createChildrenFiber了");
      }
      if (fiber.type == "TEXT_ELEMENT") {
        return;
      }

      let isFirstChild = true;
      let lastChild = null;
      (fiber.props as { children: ElementInformation[] }).children.forEach(
        (child) => {
          const newFiber: Fiber = {
            type: child.type,
            props: child.props,
            dom: null,
            child: null,
            silbing: null,
            parent: null,
          } as Fiber;
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
        }
      );
    }

    /**
     * 找到下一个要渲染的fiber
     * @param nextUnitOfWork 当前正在渲染的fiber
     */
    function findNextWorkInProgressFiber(nextUnitOfWork: Fiber): Fiber {
      // throw new Error("Function not implemented.");
      //如果有儿子，先访问左儿子
      if (nextUnitOfWork.child) {
        return nextUnitOfWork.child;
      } else if (nextUnitOfWork.silbing) {
        return nextUnitOfWork.silbing;
      }
      //如果没有儿子，就一直往上找有右儿子的爸爸
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
      commitWork(root);
    }

    if (deadline.timeRemaining() > 30 && nextUnitOfWork != null) {
      // 处理类似div、"Hello world!"这种节点
      const dealingHostComponent = () => {
        nextUnitOfWork.dom = createDom(nextUnitOfWork);
        createChildrenFiber(nextUnitOfWork);
      };

      // 处理类似App这种节点
      const dealingFunctionComponent = () => {
        if (typeof nextUnitOfWork.type != "function") {
          throw new Error(
            "进入dealingFunctionComponent的时候,这个节点不是一个function节点"
          );
        }

        const elementInformation = nextUnitOfWork.type(nextUnitOfWork.props);

        const newFiber: Fiber = {
          type: elementInformation.type,
          props: elementInformation.props,
          dom: null,
          child: null,
          parent: nextUnitOfWork,
          silbing: null,
        } as Fiber;
        nextUnitOfWork.child = newFiber;
      };

      if (typeof nextUnitOfWork.type != "function") dealingHostComponent();
      else dealingFunctionComponent();
      nextUnitOfWork = findNextWorkInProgressFiber(nextUnitOfWork);

      if (nextUnitOfWork == null) {
        commitRoot(workInProgressRoot);
      }
    }
    requestIdleCallback(wookLoop);
  }
  requestIdleCallback(wookLoop);
}

export const WeiReact = { createElement, render };
