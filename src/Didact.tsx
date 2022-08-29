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
      };

type Fiber = {
    dom: HTMLElement | Text;
    child: Fiber;
    silbing: Fiber;
    parent: Fiber;
} & ElementInformation;

function createElement(type: keyof HTMLElementTagNameMap, props: Object, ...children: (ElementInformation | string)[]): ElementInformation {
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
    let workInProgressRoot = {
        type: element.type,
        props: element.props,
        dom: null,
        child: null,
        silbing: null,
        parent: null,
    } as Fiber;
    let workInProgressFiber = workInProgressRoot;
    /**
     * 1.将DOM树转化为二叉树
     * 2.创建DOM元素
     * @param deadline 剩余时间
     */
    function wookLoop(deadline: IdleDeadline): void {
        /**
         * 创建DOM
         * @param element 要渲染上去的元素的信息
         * @returns dom元素
         */
        function createDom(element: ElementInformation): HTMLElement | Text {
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
                            (dom as HTMLElement).addEventListener(key.substring(2).toLowerCase(), value);
                        } else {
                            (dom as HTMLElement).setAttribute(key, value);
                        }
                    });
            }
            return dom;
        }

        /**
         * 将DOM树节点转化为二叉树节点
         * @param fiber 要渲染的DOM元素的信息，要转换为二叉树的节点
         */
        function createChildrenFiber(fiber: Fiber) {
            if (fiber.type != "TEXT_ELEMENT") {
                let isFirstChild = true;
                let lastChild = null;
                fiber.props.children.forEach((child) => {
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
                });
            }
        }

        /**
         * 找到下一个要渲染的fiber
         * @param workInProgressFiber 当前正在渲染的fiber
         */
        function findNextWorkInProgressFiber(workInProgressFiber: Fiber): Fiber {
            // throw new Error("Function not implemented.");
            //如果有儿子，先访问左儿子
            if (workInProgressFiber.child) {
                return workInProgressFiber.child;
            }
            else if(workInProgressFiber.silbing){
                return workInProgressFiber.silbing;
            }
            //如果没有儿子，就一直往上找有右儿子的爸爸
            else {
                let now = workInProgressFiber;
                while (now.parent) {
                    if (now.parent.silbing) return now.parent.silbing;
                    else now = now.parent;
                }
                return null;
            }
        }

        function commitRoot(root: Fiber) {
            function commitWork(fiber: Fiber) {
                if (fiber.type == "TEXT_ELEMENT") {
                    return;
                }
                if (fiber.child) {
                    fiber.dom.appendChild(fiber.child.dom);
                    commitWork(fiber.child);
                    let silbing = fiber.child.silbing;
                    while (silbing) {
                        fiber.dom.appendChild(silbing.dom);
                        commitWork(silbing);
                        silbing = silbing.silbing;
                    }
                }
            }
            commitWork(root);
            container.appendChild(root.dom);
        }


        if (deadline.timeRemaining() > 30 && workInProgressFiber != null) {
            workInProgressFiber.dom = createDom(workInProgressFiber);
            createChildrenFiber(workInProgressFiber);
            workInProgressFiber = findNextWorkInProgressFiber(workInProgressFiber);
            if (workInProgressFiber == null) {
                commitRoot(workInProgressRoot);
            }
        }
        requestIdleCallback(wookLoop);
    }
    requestIdleCallback(wookLoop);
}

export const WeiReact = { createElement, render };

const element = (
    <div>
        <h1 className="hahaha">凯哥好厉害！</h1>
        <h1>*\^_^/*</h1>
    </div>
);

render(element, document.getElementById("root"));
