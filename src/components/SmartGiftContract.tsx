import { Contract, lovelace, Party, datetoTimeout, Payee } from '@marlowe.io/language-core-v1';
import { MY_ETERNL, MY_NAMI_2 } from '../utils/constants.tsx';

function mkSmartGift(amtLovelace: number, buyer: Party, receiver: Party){
    // hardcoding the shop address
    const shopWallet: Payee = { party: MY_ETERNL };
    const bintAmount = BigInt(amtLovelace);

    const smartGiftContract: Contract = {
      when: [
        {
          then: {
            when: [
              {
                then: {
                  // pay the shop
                  then: {
                    token: lovelace,
                    to: shopWallet,
                    then: "close",
                    pay: bintAmount,
                    from_account: receiver,
                  },
                  if: {// choice = purchase from shop
                    value: {
                      value_of_choice: {
                        choice_owner: receiver,
                        choice_name: "purchase",
                      },
                    },
                    equal_to: 1n,
                  },
                  else: {// choice = 0, donate to charity
                    token: lovelace,
                    to: { account: MY_NAMI_2 },
                    then: "close",
                    pay: bintAmount,
                    from_account: receiver,
                  },
                },
                // choice setup -- Owner? Name? Bounds?
                case: {
                  for_choice: {
                    choice_owner: receiver,
                    choice_name: "purchase",
                  },
                  // 1 = purchase, 0 = donate
                  choose_between: [{ to: 1n, from: 0n }],
                },
              },
            ],
            // choice timeout
            timeout_continuation: {
              token: lovelace,
              to: { account: MY_NAMI_2 },
              then: "close",
              pay: bintAmount,
              from_account: receiver,
            },
            timeout: datetoTimeout(new Date("2024-12-31 11:59:59")),
          },
          // initial deposit
          case: {
            party: buyer,
            of_token: lovelace,
            into_account: receiver,
            deposits: bintAmount,
          },
        },
      ],
      // deposit timeout
      timeout_continuation: "close",
      timeout: datetoTimeout(new Date("2024-12-31 11:59:59")),
    };

    return smartGiftContract;
}

export default mkSmartGift;
