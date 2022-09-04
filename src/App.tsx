import { WeiReact, useState } from "./WeiReact";

function Wei(props: any) {
    const [state, setState] = useState(1);
    return (
        <h2
            style="user-select: none"
            onClick={() => {
                setState((state: any) => state + 1);
            }}
        >
            happy!
            {state % 2 ? <h1>state is even</h1> : <h4>state is odd</h4>}
            <h3>can you insert after me? No, you can't!!!!!</h3>
        </h2>
    );
}

WeiReact.render(<Wei />, document.getElementById("root"));
