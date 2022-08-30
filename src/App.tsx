import { WeiReact } from "./Didact";

function Wei(props: any) {
  return (
    <div>
      <h1 className="hahaha">凯哥好厉害！</h1>
      <h1 className="iiiiii">*\^_^/*sssss</h1>
      <Kai />
    </div>
  );
}

// function Kai(props: any) {
//   return (
//     <div>
//       <h1>薇薇超可爱的！</h1>
//     </div>
//   );
// }
function Kai(props: any) {
  return WeiReact.createElement(
    "div",
    null,
    WeiReact.createElement("h1", null, "薇薇超可爱的！")
  );
}

WeiReact.render(<Wei />, document.getElementById("root"));
