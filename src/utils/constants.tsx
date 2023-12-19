import { Party } from '@marlowe.io/language-core-v1';

export const views = {
    INTRO: 'Intro',
    CONTRACTS: 'Contracts',
    SIMPLE_DEMO: 'Simple Demo',
}

export const constants = {
    NAMI: 'Nami',// this will need to change after getInstalledWalletExtensions is updated
    ETERNL: 'eternl',
    LACE: 'lace',
}

// change this to your own active runtime instance if applicable
// this a private IOG instance
// TODO: dependency: add public runtime instance from Tomasz
export const RUNTIME_URL: string = "https://marlowe-runtime-preprod-web.demo.scdev.aws.iohkdev.io";

// nami is a single address wallet -- this address does not change throughtout execution
export const MY_NAMI: Party = {address: 'addr_test1qqms53j46dvjxre8pwnq22jtfxak0gn8qaadpwducpmc6kt8vy88dkve8vjaap9d4wgt58n8f58jna69hvh7fxmsva5q99hyur'};

// lace is a single address wallet?
export const MY_LACE: Party = {address: 'addr_test1qrpmn4mwv5668xf2774xlajxjg6ude5cavsr56pn0dzxdzrql5hfz3tpzvdhkdsuc8p8q0xtztpr58emf9jlgf99xdmq7pkl99'};

// TODO -- eternl is a multi-address wallet.
export const MY_ETERNL: Party = {address: 'addr_test1qqnf6pz23n9lk36v9we9jttuykqq4rcaucwy323ktyujklfcl6cy6z4a2cal7pt5wswqg2683knnehasp3cc6jcugl9qjse7zt'};