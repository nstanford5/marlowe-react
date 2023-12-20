// React && helper imports
import './App.css';
import React from 'react';
import { useState, useEffect } from 'react';
import { views, constants, RUNTIME_URL } from './utils/constants.tsx';
import IntroPage from './components/IntroPage.js';
import ButtonAppBar from './components/ButtonAppBar.js';
import Contracts from './components/Contracts.js';
import SimpleDemo from './components/SimpleDemo.js';
import mkSimpleDemo from './components/SimpleDemoContract.tsx';
import SmartGift from './components/SmartGift.js';
import mkSmartGift from './components/SmartGiftContract.tsx';

// marlowe TS-SDK imports
import { mkRuntimeLifecycle } from '@marlowe.io/runtime-lifecycle/browser';
import { SupportedWalletName } from '@marlowe.io/wallet/browser';
import { ApplyInputsRequest } from '@marlowe.io/runtime-lifecycle/api';
import * as wallet from '@marlowe.io/wallet';
import { AddressBech32, unAddressBech32 } from '@marlowe.io/runtime-core';
import { 
    Contract, 
    Input, 
    IDeposit, 
    Party, 
    lovelace, 
    ChoiceId, 
    ChoiceName, 
    Bound,
    Choice,
    IChoice
} from '@marlowe.io/language-core-v1';


const App: React.FC = () => {
    const [view, setView] = useState(views.INTRO);
    const [nami, setNami] = useState(false);
    const [lace, setLace] = useState(false);
    const [eternl, setEternl] = useState(false);
    const [walletChoice, setWalletChoice] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [demoFlag, setDemoFlag] = useState(false);
    const [openSnack, setOpenSnack] = useState(false);
    const [giftFlag, setGiftFlag] = useState(false);
    const handleSnackClose = () => { setOpenSnack(false); };
    const handleOpenModal = () => { setOpenModal(true); }
    const handleCloseModal = () => { setOpenModal(false); }
    const handleWalletChoice = (a: string) => { setWalletChoice(a); }
    let names: string[] = [];

    // converts ADA to Lovelace
    const parseADA = (num: Number) => {
        const numbNum: number = num as unknown as number;
        return numbNum * 1000000;
    };
    
    /**
     * Build this for demo
     * 
     * RE-NAME -- function?
     * 
     * 1. connect to runtime
     * 2. create contract txn
     * 3. wait for txn confirmation
     * 4. building inputs
     * 5. Submitting inputs
     */
    async function handleAmount(amt: Number, bobAddrRef: string){
        console.log(`The amount you entered is: ${amt}`);
        const amtLovelace = parseADA(amt);
        console.log(`We converted that to: ${amtLovelace} lovelace`);
        const supportedWallet: SupportedWalletName = walletChoice as SupportedWalletName;
        const bWallet = await wallet.mkBrowserWallet(supportedWallet);

        // get the address from the contract deployer
        const aliceAddr32: AddressBech32 = await bWallet.getChangeAddress();
        const aliceAddr: string = unAddressBech32(aliceAddr32);

        const alice: Party = {address: aliceAddr };
        // get address from UI
        const bob: Party = {address: bobAddrRef};
        
        // connect to runtime
        const runtimeLifecycle = await mkRuntimeLifecycle({
            walletName: supportedWallet,
            runtimeURL: RUNTIME_URL
        });

        // create contract from ./components/SimpleDemoContract.tsx
        const myContract: Contract = mkSimpleDemo(amtLovelace, alice, bob);

        // deploy contract, intiate signing
        // ctID = [contractId, txn string]
        const ctID = await runtimeLifecycle.contracts.createContract({
            contract: myContract,
        });

        // TODO -- is this considered good TS?
        const bintAmount: bigint = amtLovelace as unknown as bigint;

        const deposit: IDeposit = {
            input_from_party: alice,
            that_deposits: bintAmount,
            of_token: lovelace,
            into_account: bob,
        };

        // prepare deposit input
        const inputs: Input[] = [deposit];
        const depositRequest: ApplyInputsRequest = {
            inputs
        };

        // We must wait for the contract creation to finalize before deposits are available
        // add something to UI to indicate this
        const contractConfirm: boolean = await bWallet.waitConfirmation(ctID[1]);
        console.log(`Contract creation txn confirmed is: ${contractConfirm}\nTXID(input to Cardanoscan): ${ctID[1]}`);

        if(contractConfirm){
            try{
                const txId = await runtimeLifecycle.contracts.applyInputs(ctID[0], depositRequest);
                const depositConfirm: boolean = await bWallet.waitConfirmation(txId)
                console.log(`Txn confirmed: ${depositConfirm}\nHere is your receipt${txId}`);
            } catch(e) {
                console.log(`Error: ${e}`);
            }
        } else {
            console.log(`The transaction was not confirmed.`);
        }
    }

    /**
     * TODO -- change console logs to SnackBar action
     * 
     * The steps of this Contract are as follows..
     * 
     * 1. Gather input parameters
     * 2. Create and deploy contract
     * 3. Deposit from buyer
     * 4. Choice from receiver
     * 5. If zero -- send to buyer
     * 6. If one -- send to shop
     * 7. close
     */
    async function handleSmartGift(amtRef: Number, toAddrRef: string){
        console.log(`The number you entered was: ${amtRef}`);
        const amtLovelace = parseADA(amtRef);
        console.log(`We converted that to ${amtLovelace} lovelace`);
        const supportedWallet: SupportedWalletName = walletChoice as SupportedWalletName;
        const browserWallet = await wallet.mkBrowserWallet(supportedWallet);

        const buyerAddr32: AddressBech32 = await browserWallet.getChangeAddress();
        const buyerAddr: string = unAddressBech32(buyerAddr32);

        const buyer: Party = { address: buyerAddr};
        const receiver: Party = {address: toAddrRef};

        const runtimeLifecycle = await mkRuntimeLifecycle({
            walletName: supportedWallet,
            runtimeURL: RUNTIME_URL,
        });

        const sGiftContract: Contract = mkSmartGift(amtLovelace, buyer, receiver);

        const ctcID = await runtimeLifecycle.contracts.createContract({
            contract: sGiftContract,
        });
        
        const bintAmount: bigint = amtLovelace as unknown as bigint;

        const deposit: IDeposit = {
            input_from_party: buyer,
            that_deposits: bintAmount,
            of_token: lovelace,
            into_account: receiver,
        };

        const depositInputs: Input[] = [deposit];
        const depositRequest: ApplyInputsRequest = {
            inputs: depositInputs
        };

        const contractConfirm: boolean = await browserWallet.waitConfirmation(ctcID[1]);
        console.log(`Contract creation txn confirmed is: ${contractConfirm}\nTXID(input to Cardanoscan): ${ctcID[1]}`);

        const txId = await runtimeLifecycle.contracts.applyInputs(ctcID[0], depositRequest);
        const depositConfirm: boolean = await browserWallet.waitConfirmation(txId);
        console.log(`Txn confirmed: ${depositConfirm}`);

        if(!depositConfirm){ console.log(`The deposit failed.`); }

        console.log(`The contract is waiting for a Choice from the receiver`);
        
        // TODO
        // choice from receiver at UI
        // if 1 send to shop
        // if 0 send back to buyer

        // dealing with choices...
        const choiceName: ChoiceName = "purchase";

        const choices: ChoiceId = {
            choice_name: choiceName,
            choice_owner: receiver,
        };

        // TODO -- bring the zero in from the button
        const refundChoice: IChoice = {
            for_choice_id: choices,
            input_that_chooses_num: 0n,
        }

        // TODO -- bring the 1 in from the button
        const purchaseChoice: IChoice = {
            for_choice_id: choices,
            input_that_chooses_num: 1n,
        }

        // TODO -- create branches from inputs to ApplyInputsRequest
        // currently forces a 1 input
        const choiceInputs: Input[] = [purchaseChoice];
        const choiceRequest: ApplyInputsRequest = {
            inputs: choiceInputs,
        };

        // QUESTION -- do I need a runtimeLifecycle object for each address that will
        // need to sign txns for the DApp?
        const recRuntimeLifecycle = await mkRuntimeLifecycle({
            walletName: 'eternl',// TODO -- remove hardcoded
            runtimeURL: RUNTIME_URL,
        });
        console.log(`Connected receiver address to runtime instance`);

        console.log(`Applying input choices...`);
        const choiceTxn = await recRuntimeLifecycle.contracts.applyInputs(ctcID[0], choiceRequest);
        console.log(`Choice submission successful.\nTXN Receipt: ${choiceTxn}`);
    }

    // we only want this to run once
    useEffect(() => {
        const installedWalletExtensions = wallet.getInstalledWalletExtensions();
        installedWalletExtensions.forEach((i) => names.push(i.name));
        if(names.includes(constants.NAMI)){ setNami(true); }
        if(names.includes(constants.LACE)){ setLace(true); }
        if(names.includes(constants.ETERNL)){ setEternl(true); }
        console.log(`Browser Wallet Extensions: ${names}`);
    }, []);

    const startSimpleDemo = async () => {
        setDemoFlag(true);// do I need this if I'm going to change pages?
        setView(views.SIMPLE_DEMO);
    }

    const startSmartGift = () => {
        setGiftFlag(true);
        setView(views.SMART_GIFT);
    }

    return(
        <div className='App'>
            <ButtonAppBar
                walletChoice={walletChoice} 
                handleWalletChoice={handleWalletChoice}
                openModal={openModal}
                handleOpenModal={handleOpenModal}
                handleCloseModal={handleCloseModal}
                openSnack={openSnack}
                handleSnackClose={handleSnackClose}
                setView={setView}
                setOpenSnack={setOpenSnack}
                nami={nami}
                lace={lace}
                eternl={eternl}
            />
            {view === views.INTRO && <IntroPage />}
            {view === views.CONTRACTS && <Contracts 
                startSimpleDemo={startSimpleDemo}
                demoFlag={demoFlag}
                giftFlag={giftFlag}
                startSmartGift={startSmartGift}
            />}
            {view === views.SIMPLE_DEMO && <SimpleDemo handleAmount={handleAmount}/>}
            {view === views.SMART_GIFT && <SmartGift handleSmartGift={handleSmartGift}/>}
        </div>
    );
};

export default App;