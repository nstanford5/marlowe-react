import { Contract, lovelace, Party, datetoTimeout, Payee } from '@marlowe.io/language-core-v1';
import { MY_NAMI, MY_LACE } from '../utils/constants.tsx';

function mkSmartGift(amtLovelace: number, buyer: Party, receiver: Party){
    const bintAmount: bigint = amtLovelace as unknown as bigint;
    // hardcoding the shop address
    // maybe this is wrong?
    const payShopWallet: Payee = { party: MY_NAMI };

    const smartGiftContract: Contract = {
      when: [
        {
          then: {
            when: [
              {
                then: {
                  then: {
                    token: lovelace,
                    to: payShopWallet,
                    then: "close",
                    pay: bintAmount,
                    from_account: receiver,
                  },
                  if: {
                    // how do I frame the purchase from the receiver standpoint
                    value: {
                      value_of_choice: {
                        choice_owner: receiver,
                        choice_name: "purchase",
                      },
                    },
                    equal_to: 1n,
                  },
                  else: {
                    token: lovelace,
                    to: { account: buyer },
                    then: "close",
                    pay: bintAmount,
                    from_account: receiver,
                  },
                },
                case: {
                  for_choice: {
                    choice_owner: receiver,
                    choice_name: "purchase",
                  },
                  choose_between: [{ to: 1n, from: 0n }],// how to deal with choices..
                },
              },
            ],
            timeout_continuation: {
              token: lovelace,
              to: { account: buyer },
              then: "close",
              pay: bintAmount,
              from_account: receiver,
            },
            timeout: datetoTimeout(new Date("2024-12-20 12:00:00")),
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
      timeout_continuation: "close",
      timeout: datetoTimeout(new Date("2025-01-01 00:00:01")),
    };
    return smartGiftContract;
}

export default mkSmartGift;