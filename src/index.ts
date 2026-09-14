import { readConfig, setUser } from "./config.js";

function main() {
  setUser("Baraa");

  const config = readConfig();

  console.log(config);
}

main();
