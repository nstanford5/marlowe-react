import { Contract, lovelace, Party, datetoTimeout, Payee } from '@marlowe.io/language-core-v1';
import { MY_NAMI } from '../utils/constants.tsx';

function mkSmartGift(amtLovelace: number, buyer: Party, receiver: Party){
    const bintAmount = BigInt(amtLovelace);
    // hardcoding the shop address
    const shopWallet: Payee = { party: MY_NAMI };

    const smartGiftContract: Contract = {
      when: [
        {
          then: {
            when: [
              {
                then: {
                  // purchase option
                  then: {
                    token: lovelace,
                    to: shopWallet,
                    then: "close",
                    pay: bintAmount,
                    from_account: receiver,
                  },
                  if: {
                    value: {
                      value_of_choice: {
                        choice_owner: receiver,
                        choice_name: "purchase",
                      },
                    },
                    equal_to: 1n,
                  },
                  // refund option
                  else: {
                    token: lovelace,
                    to: { account: buyer },
                    then: "close",
                    pay: bintAmount,
                    from_account: receiver,
                  },
                },
                // choices
                case: {
                  for_choice: {
                    choice_owner: receiver,
                    choice_name: "purchase",
                  },
                  choose_between: [{ to: 1n, from: 0n }],
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
