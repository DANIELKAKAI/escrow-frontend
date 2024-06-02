require("dotenv").config();

import WalletConnect from "../components/WalletConnect";

import Products from "@/components/shared/Products";

function App() {
  return (
    <>
      <WalletConnect></WalletConnect>
      <Products />
    </>
  );
}

export default App;
