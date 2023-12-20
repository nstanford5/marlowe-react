import { Contract, lovelace, Party, datetoTimeout } from '@marlowe.io/language-core-v1';

function mkSimpleDemo(amtLovelace: number, alice: Party, bob: Party){
    const bintAmount: bigint = amtLovelace as unknown as bigint;
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
          timeout: datetoTimeout(new Date("2023-12-19 18:00:00")),
    };
    return simpleDemoContract;
}

export default mkSimpleDemo;
