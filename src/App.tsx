import { WeiReact, useState } from "./Didact";

function Wei(props: any) {
  const [state, setState] = useState(123123);
  const [people, setPeople] = useState("Wei");
  return (
    <div>
      <h1
        onClick={() => {
          setState(0);
        }}
      >
        {state}
      </h1>
      <h2
        onClick={() => {
          setPeople((people) => {
            if (people == "Wei") return "Kai";
            else return "Wei";
          });
        }}
      >
        {people}
      </h2>
    </div>
  );
}

WeiReact.render(<Wei />, document.getElementById("root"));
