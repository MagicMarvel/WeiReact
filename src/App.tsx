import { WeiReact, useState } from "./WeiReact";

function Wei(props: any) {
  const [state, setState] = useState(1);
  return (
    <div>
      <div
        style="
      color:pink"
        onClick={() => {
          setState((state) => state + 1);
        }}
      >
        happy!
      </div>
      <h3>Wei</h3>
      <h2>{state}</h2>
    </div>
  );
}

WeiReact.render(<Wei />, document.getElementById("root"));
