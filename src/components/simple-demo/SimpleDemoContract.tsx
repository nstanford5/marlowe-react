import { Contract, Value, lovelace } from '@marlowe.io/language-core-v1';

function mkSimpleDemo(){
    const simpleDemoContract: Contract = {
        when: [
            {
              then: "close",
              case: {
                party: {
                  address:
                    "addr_test1qqms53j46dvjxre8pwnq22jtfxak0gn8qaadpwducpmc6kt8vy88dkve8vjaap9d4wgt58n8f58jna69hvh7fxmsva5q99hyur",
                },
                of_token: lovelace,
                into_account: {
                  address:
                    "addr_test1qqms53j46dvjxre8pwnq22jtfxak0gn8qaadpwducpmc6kt8vy88dkve8vjaap9d4wgt58n8f58jna69hvh7fxmsva5q99hyur",
                },
                deposits: 5000000000n,
              },
            },
          ],
          timeout_continuation: "close",
          timeout: 1703693640000n,
    };
    return simpleDemoContract;
}

export default mkSimpleDemo;