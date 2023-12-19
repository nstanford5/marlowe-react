import { Contract, lovelace, Party, Value } from '@marlowe.io/language-core-v1';

function mkSimpleDemo(amt: Value, alice: Party, bob: Party){
    const bintAmount: bigint = amt as bigint;
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
          timeout: 1703693640000n,// TODO -- change to datetoTimeout
    };
    return simpleDemoContract;
}

export default mkSimpleDemo;
