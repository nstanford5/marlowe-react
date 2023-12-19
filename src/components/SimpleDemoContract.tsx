import { Contract, lovelace, Party, IDeposit } from '@marlowe.io/language-core-v1';
import { MY_NAMI, MY_LACE } from '../utils/constants.tsx';

const alice: Party = MY_LACE;
const bob: Party = MY_NAMI;

// custom deposit defined by SC
export const deposit: IDeposit = {
    input_from_party: alice,
    that_deposits: 50000000n,// n here converts this to a BigNumber
    of_token: lovelace,
    into_account: bob,
};

function mkSimpleDemo(){
    const simpleDemoContract: Contract = {
        when: [
            {
              then: "close",
              case: {
                party: alice,
                of_token: lovelace,
                into_account: bob,
                deposits: 50000000n,
              },
            },
          ],
          timeout_continuation: "close",
          timeout: 1703693640000n,// TODO -- change to datetoTimeout
    };
    return simpleDemoContract;
}

export default mkSimpleDemo;
