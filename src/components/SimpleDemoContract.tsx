import { Contract, lovelace, Party, datetoTimeout } from '@marlowe.io/language-core-v1';

function mkSimpleDemo(amtLovelace: number, alice: Party, bob: Party){
  const bintAmount = BigInt(amtLovelace);

  const simpleDemoContract: Contract = {
    when: [
      {
        then: "close",
        case: {
          party: alice,
          of_token: lovelace,
          into_account: bob,
          deposits: bintAmount,
        },
      },
    ],
    timeout_continuation: "close",
    timeout: datetoTimeout(new Date("2024-12-31 11:59:59")),
  };
  return simpleDemoContract;
}

export default mkSimpleDemo;