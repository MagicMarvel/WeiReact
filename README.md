# WeiReact
理解前端最著名框架的一次小小的尝试！
- 实现了React的并发模式
- 实现了Fiber架构
- 实现了虚拟Dom的Diff算法
- 实现了基本Hook如useState


感谢大佬的文章 [Build your own React (pomb.us)](https://pomb.us/build-your-own-react/) 我也是看着这篇文章开始我的手写 React 之旅的

本项目如何运行？

```bash
yarn install
yarn start
```

# 解析 TSX

首先你需要一个 Webpack 将你写好的 ts 代码编译为 js 并自动在 HTML 里引入，你需要一个这样的东西：

```ts
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/App.tsx",
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: "随便写",
      template: "./src/template.html",
    }),
  ],

  devtool: "inline-source-map",
  devServer: {
    // output to dist
    static: "./dist",
  },

  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
};
```

这段代码会把 `./src/App.tsx` 编译成 js，放在 dist 目录下，HtmlWebpackPlugin 会自动把输出的 js 链接到 HTML 里，`inline-source-map` 是在浏览器弹出报错的时候，显示报错是在原文件里的哪个地方，不然报错就会显示在编译后的文件的某一行上，这样就找不到问题，ts-loader 是用来加载 ts 文件的插件，写 ts 必须有这个插件才能解析，并且 tsx 文件里的类 Html 部分也是使用 ts-loader 来解析的

这是 `App.tsx`，这里面有引入我们自己实现的react

```tsx
import { WeiReact, useState } from './WeiReact'

function Wei(props: any) {
    const [state, setState] = useState(1)
    return (
        <h2
            style={{"user-select": "none"}}
            onClick={() => {
                setState((state: any) => state + 1)
            }}
        >
            happy!
            {state % 2 ? <h1>state is even</h1> : <h4>state is odd</h4>}
        	<App foo = {"hei foo!"}/>
        </h2>
    )
}

WeiReact.render(<Wei />, document.getElementById('root'))
```

我们会发现，函数 `Wei()` 返回了一个 tsx 标签，这个在 ts 文件里面是什么呢？如果我们写 ts 我们是不能直接操作 tsx 部分的东西的

我们用 babel 解析出来（React runtime 在这里使用 classic 而不是 automatic ），会是如下结果：

```js
import { WeiReact, useState } from './WeiReact'

function Wei(props) {
    return React.createElement("h2", {
        style: {
            "user-select": "none"
        },
        onClick: () => {
            setState(state => state + 1);
        }
    }, "happy!", state % 2 ? 
	    React.createElement("h1", null, "state is even") : 
	    React.createElement("h4", null, "state is odd"),
        React.createElement(App, { foo: "hei foo!" }));
}

WeiReact.render(React.createElement(Wei, null), document.getElementById('root'))
```

^bd4118

会发现，tsx 会被解析成如上的格式，换而言之，一个 tsx 可以用如下的数据结构表示出来

```tsx
interface HTMLElementInformation {
    //标签名
    type: keyof HTMLElementTagNameMap
    props: {
        //属性
        [key: string]: any
        //子元素
        children: ElementInformation[]
    }
}

interface TextElementInformation {
    type: 'TEXT_ELEMENT'
    props: {
        nodeValue: string
    }
}

interface FunctionComponentInformation {
    type: (props: any) => ElementInformation
    props: Object
    hooks: { state: any; actions: ((state: any) => any)[] }[]
}

type ElementInformation =
    | HTMLElementInformation
    | TextElementInformation
    | FunctionComponentInformation
```

^9a8c84

我们发现还有一个问题是，我们的 tsx 是用 `React.createElement` 传入 react 内部的，但是我们自己的 react 也会实现这个方法，我们需要让 babel 解析的时候不解析为 `React.createElement` 而是解析为我们的 `Wei.createElement`，所以我们需要配置 babel 的 tsc，在项目根目录创建 `tsconfig.json`

```json
{
    "compilerOptions": {
        "outDir": "./dist/",
        "sourceMap": true,
        // 使用什么模块管理系统
        "module": "ES6",
        "target": "ES2015",
        "jsx": "react",
        "jsxFactory": "WeiReact.createElement",
        "allowJs": true
        // "moduleResolution": "node"
    }
}
```

这样，我们编译后的 tsx 就是用的是 `WeiReact.createElement`

# 实现 `createElement`

我们先编写我们的第一步 `WeiReact.createElement`，让数据可以传入 React

```tsx
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
    if (typeof type == 'function')
        return {
            type,
            props,
            hooks: [],
        }

    return {
        type,
        props: {
            ...props,
            children: children
                ? children.map((child) => {
                      if (typeof child === 'string') {
                          return {
                              type: 'TEXT_ELEMENT',
                              props: { nodeValue: child },
                          }
                      }
                      if (typeof child === 'number') {
                          return {
                              type: 'TEXT_ELEMENT',
                              props: {
                                  nodeValue: child.toString(),
                              },
                          }
                      }
                      return child
                  })
                : [],
        },
    }
}
```

上面代码里出现的数据结构 `ElementInformation` 是这样的 ![[#^9a8c84]]
tsx 通过这个函数解析后，最后会形成一棵树（HTMLElementInformation 里面有一个 ElementInformation，互相嵌套成树），我们将这颗 ElementInformation 树传入 render 函数，就像这样 ![[#^bd4118]]
那我们现在也拿到了用户想让我们 react 渲染啥，也拿到了我们应该把东西渲染到哪，我们现在就可以开始把 render 函数完善一下

# 实现 render 函数 

render 函数里面的主体是一个不断运行的死循环，里面用到了一个 `requestIdleCallback` 函数，这个函数可以注册一个自己的函数到浏览器，在浏览器有空余时间的时候会执行这个函数，其中 `workInProgressRoot` 一直指向 Root（就是所有的 tsx 要挂在到哪个容器下面）

这里还有一个变量：nextUnitOfWork，这个变量指的是下一个需要渲染的节点是哪个，这是 React 高效的核心 [[#Concurrent 模式]]

```tsx
/**
 * 将元素渲染到容器上
 * @param element 要渲染上去的元素的信息
 * @param container 要渲染到的容器
 */
function render(element: ElementInformation, container_: HTMLElement) {
    container = container_
    workInProgressRoot = {
        type: 'div',
        props: {
            children: [element],
        },
        alternate: null,
        dom: container,
        child: null,
        effectTag: 'MODIFY',
        parent: null,
        silbing: null,
    }
    nextUnitOfWork = workInProgressRoot

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

        if (deadline.timeRemaining() > 30 && nextUnitOfWork != null) {
		    .......
        }
        requestIdleCallback(wookLoop)
    }
    requestIdleCallback(wookLoop)
}

```

## Concurrent 模式

如果将我们有的 `elementInformation` 树直接全部渲染上真实 Dom，但凡页面大一点，就会导致浏览器一直在执行 react 的 js 然后无法响应用户的输入，用户就感觉页面卡住了，带来了不友好的体验，所以提出了 Concurrent 模式，这个模式旨在将整个任务拆分开来，浏览器有空的时候就执行几个任务，没空就先响应用户的操作，而不是一直处理 React 的渲染

这样就要求我们解决下面两个问题 

1. 任务如何按时间片拆分 ^ccaf93
2. 时间片间如何中断与恢复 ^94990b

整个 React 的任务可以简单的描述为，将一颗虚拟的 Dom 树渲染到真实的 Dom 树上，那我们可以把任务拆分为两部分 

- 计算虚拟 Dom
- 改变真实 Dom

计算虚拟 Dom 是可以被打断停止的，计算好了后要改变真实 Dom 的时候，是不可以被打断的，不然用户就会看到不完整的内容

### 虚拟 dom 树的运作方式

我们知道，对 Dom 树的计算不能一次性完成，如果计算量过大会导致页面卡顿带来糟糕的体验，所以我们将 Dom 树的计算按节点拆开，从根节点开始，创建它的 Dom 实例（可能是这么叫？），然后再到根节点下一个节点创建他的实例 [[#workloop|见下面workloop章节]]，最后将这些实例全部统统塞到真实 Dom 里就完工了 [[#^ccaf93|解决问题一]]

还有一个问题就是我们如何中断 React 的运行并在合适的时候如何让他接着之前的结果运行下去 [[#^94990b|解决问题二]]，看下面这个图，我们平时看到一棵树第一反应基本上都是用深搜，但是如果在这种情况下，搜索到一半停止了，没有额外信息（记录哪个点是否到达过）是不能知道下一个点是啥的，所以 React 采用了第二种树结构，只要遵循三个法则，就能很简单的找到下一个需要运行的节点是哪个，这使得 React 可以少维护一些状态

![[Pasted image 20230724150328.png]]

## workloop

我们在一轮 `workLoop` 里面，对于一个 fiber 树节点，只需要：

普通标签（类似 `<div></div>`）

1. 创建 DOM 元素
2. 生成子元素的 fiber 结构（利用 `fiber.props.children` 生成孩子的 fiber，于此同时孩子的 `fiber.props.children` 也会被生成）
3. 查找下一个 fiber

文本标签（类似 `<div>HelloWorld</div>` 里的 HelloWorld）

1. 创建 Dom 元素
2. 查找下一个 fiber 

```tsx
        // 处理类似div、"Hello world!"这种节点
        function dealingHostComponent(
            nextUnitOfWork: (HTMLElementInformation | TextElementInformation) &
                FiberInformation,
        ) {
            if (nextUnitOfWork.effectTag == 'PLACEMENT')
                nextUnitOfWork.dom = createDom(nextUnitOfWork)

            if (!isTextElementInformation(nextUnitOfWork)) {
                createChildrenFiber(
                    nextUnitOfWork,
                    nextUnitOfWork.props.children,
                )
            }
        }
```

函数式组件（类似 `<App />`）

1. 运行它，得到 ElementInformation
2. 根据 ElementInformation 生成一个 fiber
3. 查找下一个 fiber

```tsx
        // 处理类似App这种函数式组件节点
        function dealingFunctionComponent(
            nextUnitOfWork: FunctionComponentInformation & FiberInformation,
        ) {
            if (isFunctionComponentInformation(nextUnitOfWork)) {
                hookIndex = -1
                // 如果是函数式组件，直接运行该函数(利用createElement函数生成 ElementInformation 树)
                // nextUnitOfWork.type即是该函数
                const elementInformation = nextUnitOfWork.type(
                    nextUnitOfWork.props,
                )
                createChildrenFiber(nextUnitOfWork, [elementInformation])
            }
        }
```

这里给出 fiber 树的数据结构定义

```tsx
type ElementInformation =
    | HTMLElementInformation
    | TextElementInformation
    | FunctionComponentInformation

interface FiberInformation {
    dom: HTMLElement | Text
    child: Fiber
    silbing: Fiber
    parent: Fiber
    alternate: Fiber
    effectTag: 'PLACEMENT' | 'MODIFY'
}

type Fiber = FiberInformation & ElementInformation
```

### createDom

这个函数用于对一个 fiber 节点创建它对应的 dom 节点并返回，这个函数同时被文本标签和普通标签使用

```tsx
        /**
         * 创建DOM
         * @param element 要渲染上去的元素的信息
         * @returns dom元素
         */
        function createDom(
            element: HTMLElementInformation | TextElementInformation,
        ): HTMLElement | Text {
            // let dom: HTMLElement | Text;
            if (isTextElementInformation(element)) {
                return document.createTextNode(element.props.nodeValue)
            } else {
                let dom = document.createElement(element.type)
                // .keys 是把属性提取出来
                Object.keys(element.props)
                    .filter((key) => key != 'children')
                    .forEach((key) => {
                        const value = element.props[key]
                        if (key.startsWith('on')) {
                            dom.addEventListener(
                                key.substring(2).toLowerCase(),
                                value,
                            )
                        } else {
                            dom.setAttribute(key, value)
                        }
                    })
                return dom
            }
        }
```

### createChildrenFiber

根据一个 Fiber 节点和它的孩子节点的 elementInformation，创建出这个 Fiber 节点的孩子的 fiber 节点，注意，如果你之前有过一个 fiber 树，那么创建孩子节点的 fiber 的时候要 diff 孩子们之前的 fiber 节点，然后如果是同一个类型的 Fiber 节点可以标注 `MODITY`，如果不是同一个类型的 Fiber 节点新 fiber 可以标注为 `PLACEMENT`，老 fiber 把它 push 进 delete 数组，在 commit 的时候全部删掉就好。见下面的代码，要额外注意的是，Js 对象是引用类型的，创建子孩子的 fiber 的时候一定要想清楚，哪里是需要直接引用之前的对象，哪个是要直接拷贝一份对象

这一部分比较复杂，需要多点时间理解

```tsx
        /**
         * 创建子元素的fiber
         * @param fiber 要被创建fiber的元素的父元素fiber
         * @param children 这个父元素fiber所属的所有孩子节点的elementInformation数组
         */
        function createChildrenFiber(
            fiber: FiberInformation &
                (HTMLElementInformation | FunctionComponentInformation),
            children: ElementInformation[],
        ) {
            let isFirstChild = true
            let lastSibling = null

            let oldFiber = fiber.alternate && fiber.alternate.child
            let index = 0

            while (index < children.length || oldFiber) {
                let elementInformation = children[index]

                let newFiber: Fiber
                if (elementInformation && oldFiber) {
                    const sameType = elementInformation.type == oldFiber.type
                    if (!sameType) {
                        deletions.push(oldFiber)
                        newFiber = {
                            effectTag: 'PLACEMENT',
                            ...elementInformation,
                            dom: null,
                            alternate: null,
                            child: null,
                            silbing: null,
                            parent: null,
                        }
                    }

                    if (sameType) {
                        newFiber = {
                            effectTag: 'MODIFY',
                            ...elementInformation,
                            dom: oldFiber.dom,
                            alternate: oldFiber,
                            child: null,
                            silbing: null,
                            parent: null,
                        }
                    }
                }
                // 孩子节点比之前的少
                if (!elementInformation && oldFiber) {
                    deletions.push(oldFiber)
                }

                // 孩子节点比之前的多
                if (elementInformation && !oldFiber) {
                    newFiber = {
                        effectTag: 'PLACEMENT',
                        ...elementInformation,
                        dom: null,
                        alternate: null,
                        child: null,
                        silbing: null,
                        parent: null,
                    }
                }

                if (isFirstChild) {
                    fiber.child = newFiber
                    newFiber.parent = fiber
                    lastSibling = newFiber
                } else {
                    lastSibling.silbing = newFiber
                    lastSibling = newFiber
                    newFiber.parent = fiber
                }

                isFirstChild = false

                oldFiber = oldFiber && oldFiber.silbing
                index++
            }
        }
```

### findNextWorkInProgressFiber

见代码

```tsx
        /**
         * 找到下一个要渲染的fiber
         * @param nextUnitOfWork 当前正在渲染的fiber
         */
        function findNextWorkInProgressFiber(nextUnitOfWork: Fiber): Fiber {
            //如果有儿子，先访问儿子
            if (nextUnitOfWork.child) {
                return nextUnitOfWork.child
            } else if (nextUnitOfWork.silbing) {
                return nextUnitOfWork.silbing
            }
            //如果没有儿子，就一直往上找有兄弟的爸爸
            else {
                let now = nextUnitOfWork
                while (now.parent) {
                    if (now.parent.silbing) return now.parent.silbing
                    else now = now.parent
                }
                return null
            }
        }
```

### commitRoot

这里就是简单的浏览器 Dom 操作，普通的属性直接放到 dom 上就好，事件还需要用 `addEventListener` 加进去，如果以后 dom 相关操作忘记了，可以直接来这里看看

```tsx
        function commitRoot(root: HTMLElementInformation & FiberInformation) {
            function updateDom(
                dom: HTMLElement | Text,
                oldProps: any,
                newProps: any,
            ) {
                function isHTMLElement(x: any): x is HTMLElement {
                    return (x as HTMLElement).setAttribute != null
                }

                if (isHTMLElement(dom)) {
                    const keys = [
                        ...Object.keys(oldProps),
                        ...Object.keys(newProps),
                    ].filter((key) => key != 'children')
                    keys.forEach((key) => {
                        if (newProps[key]) {
                            if (key.startsWith('on')) {
                                if (oldProps[key]) {
                                    dom.removeEventListener(
                                        key.substring(2).toLowerCase(),
                                        oldProps[key],
                                    )
                                }
                                dom.addEventListener(
                                    key.substring(2).toLowerCase(),
                                    newProps[key],
                                )
                            }

                            if (!key.startsWith('on')) {
                                dom.setAttribute(key, newProps[key])
                            }
                        } else {
                            if (key.startsWith('on')) {
                                dom.removeEventListener(
                                    key.substring(2).toLowerCase(),
                                    oldProps[key],
                                )
                            }
                            if (!key.startsWith('on')) {
                                dom.removeAttribute(key)
                            }
                        }
                    })
                }
                if (!isHTMLElement(dom)) {
                    dom.nodeValue = newProps.nodeValue
                }
            }
            function commitWork(fiber: Fiber) {
                if (fiber == null) return
                if (!fiber.dom) {
                    // 函数式组件节点
                    commitWork(findNextWorkInProgressFiber(fiber))
                } else {
                    // 文本节点或者类似div这种普通元素节点
                    if (fiber.effectTag == 'PLACEMENT') {
                        // 寻找一个effectTag为"MODIFY"且有dom的节点，没有的话silbing设置为空
                        let sibling = fiber.silbing
                        while (
                            sibling &&
                            (sibling.effectTag == 'PLACEMENT' || !sibling.dom)
                        ) {
                            sibling = sibling.silbing
                        }
                        // 寻找有dom的parent
                        let parent = fiber.parent
                        while (!parent.dom) {
                            parent = parent.parent
                        }
                        if (sibling) {
                            parent.dom.insertBefore(fiber.dom, sibling.dom)
                        }
                        if (!sibling) parent.dom.appendChild(fiber.dom)
                    }
                    if (fiber.effectTag == 'MODIFY') {
                        updateDom(fiber.dom, fiber.alternate.props, fiber.props)
                    }
                    commitWork(findNextWorkInProgressFiber(fiber))
                }
            }
            function deleteFiber() {
                if (deletions) {
                    deletions.forEach((fiber: Fiber) => {
                        let parent = fiber.parent
                        while (!parent.dom) {
                            parent = parent.parent
                        }
                        parent.dom.removeChild(fiber.dom)
                    })
                    deletions = []
                }
            }
            deleteFiber()
            commitWork(root.child)
            currentRoot = root
        }
```

至此，React 最核心的部分都完成啦

# 实现 useState

useState 的状态存储在 fiber 树上的函数式组件的节点上，一旦用户调用了 setState，就让 nextUnitOfWork 直接指向树根（千万要注意）, 从上到下计算所有该计算的东西（如 diff 两棵树，找到需要改变的节点），然后渲染到真实 Dom 上

如果从上到下计算节点遇到了一个函数式组件，react 会直接运行这个函数，在执行到 useState 的时候把上一次积累在这个节点的所有的 action 一次性按时间顺序执行出来，改变 state，然后返回一个正确的 elementInformation，然后根据这个 elementInformation 创建子元素的 fiber 节点，注意函数式组件不需要创建 Dom，然后找到下一个该遍历的 fiber 节点继续执行操作 (如果子元素的 fiber 节点是一个函数式组件，react 会直接执行它），周而复始.....

如果遇到的是一个普通的节点，就直接创建这个节点的 Dom，然后按照 fiber 节点上的 elementInformation，创建子元素的 fiber 节点，然后找到下一个要运行的 fiber 节点，如果这个普通节点有一个 state 发生变化的父亲函数式节点，父亲节点在执行的时候，会给这个子节点正确的 element Information，这样子节点的数据会是最新的正确的数据

```tsx
function useState(initial: any) {
    if (!isFunctionComponentInformation(nextUnitOfWork)) {
        throw new Error('')
    }

    hookIndex += 1

    let workInProgressFiber = nextUnitOfWork
    let index = hookIndex

    if (nextUnitOfWork.hooks.length - 1 >= hookIndex) {
        // 非第一次调用这个useState
        workInProgressFiber.hooks[hookIndex].actions.forEach((fn) => {
            workInProgressFiber.hooks[hookIndex].state = fn(
                workInProgressFiber.hooks[hookIndex].state,
            )
        })
        workInProgressFiber.hooks[hookIndex].actions = []
    } else {
        // 第一次调用useState
        workInProgressFiber.hooks.push({
            state: initial,
            actions: [],
        })
    }

    let tmp = 0
    function setState(actionOrValue: ((state: any) => any) | any) {

        if (!(actionOrValue instanceof Function)) {
            workInProgressFiber.hooks[index].actions.push((state: any) => {
                return actionOrValue
            })
        } else {
            workInProgressFiber.hooks[index].actions.push(actionOrValue)
        }

        // 一旦执行setState，就需要立刻把指针移到树根，其中由于props保存了hooks的数据
        // 所以指向树根的props必须是正确的props（包含着之前hooks的props），由于js对象
        // 是引用类型的，所以直接拿上一次渲染到Dom的Fiber树上的props给目前根的props即可
        nextUnitOfWork = {
            type: 'div',
            dom: container,
            child: null,
            effectTag: 'MODIFY',
            parent: null,
            silbing: null,
            props: currentRoot.props,
            alternate: currentRoot,
        }
        workInProgressRoot = nextUnitOfWork
    }
    return [workInProgressFiber.hooks[hookIndex].state, setState]
}
```

# FAQ

1. 代码在哪？
	
	见：[MagicMarvel/WeiReact (github.com)](https://github.com/MagicMarvel/WeiReact)
	
1. `workInProgressRoot` 和 `currentRoot` 有什么区别？

	有两个 fiber 树，一个目前对应着真实 Dom 的 Fiber 树，他的 Root 就是 `currentRoot`，目前正在计算的虚拟 Dom 的 fiber 树的根节点对应的就是 `workInProgressRoot`
