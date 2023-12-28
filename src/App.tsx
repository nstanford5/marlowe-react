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
import { AddressBech32, unAddressBech32, ContractId } from '@marlowe.io/runtime-core';
import { 
    Input, 
    IDeposit, 
    Party, 
    lovelace, 
    ChoiceId, 
    ChoiceName, 
    IChoice,
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
    const [submitFlag, setSubmitFlag] = useState(false);
    const [choiceFlag, setChoiceFlag] = useState(true);
    const [toAddress, setToAddress] = useState('');
    const [ctcGift, setCtcGift] = useState<ContractId>();
    const handleSnackClose = () => { setOpenSnack(false); };
    const handleOpenModal = () => { setOpenModal(true); }
    const handleCloseModal = () => { setOpenModal(false); }
    const handleWalletChoice = (a: string) => { setWalletChoice(a); }
    let names: string[] = [];

    // converts ADA to Lovelace
    const parseADA = (num: number) => { return num * 1000000; };

    // refund choice handler for Smart Gift Card
    function handleChoice0(){
        setChoiceFlag(true);
        const choiceName: ChoiceName = "purchase";
        const receiver: Party = {address: toAddress};

        const choices: ChoiceId = {
            choice_name: choiceName,
            choice_owner: receiver,
        };

        const refundChoice: IChoice = {
            for_choice_id: choices,
            input_that_chooses_num: 0n,
        }
        // can I add this to the SmartContract.tsx file and import it here?
        // could use a return
        handleChoiceSubmit(refundChoice);
    };

    // purchaseChoice handler for Smart Gift Card
    function handleChoice1(){
        setChoiceFlag(true);
        const choiceName: ChoiceName = "purchase";
        const receiver: Party = {address: toAddress};

        const choices: ChoiceId = {
            choice_name: choiceName,
            choice_owner: receiver,
        };

        const purchaseChoice: IChoice = {
            for_choice_id: choices,
            input_that_chooses_num: 1n,
        }
        handleChoiceSubmit(purchaseChoice);
    };

    // common function for applying inputs to SmartGiftCard
    async function handleChoiceSubmit(numChoice: IChoice) {

        const choiceInputs: Input[] = [numChoice];
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

        const choiceTxn = await recRuntimeLifecycle.contracts.applyInputs(ctcGift as ContractId, choiceRequest);
        console.log(`Choice submission successful.\nTXN Receipt: ${choiceTxn}`);
    };
    
    /**
     * Build this for demo
     * 
     * 1. connect to runtime
     * 2. create contract txn
     * 3. wait for txn confirmation
     * 4. building inputs
     * 5. Submitting inputs
     */
    async function handleSimpleDemo(amt: number, bobAddrRef: string){
        console.log(`The amount you entered is: ${amt} ADA`);
        const amtLovelace = parseADA(amt);// do the manual conversion here instead amt * 1000000;
        console.log(`We converted that to: ${amtLovelace} lovelace`);
        const supportedWallet = walletChoice as SupportedWalletName;
        const bWallet = await wallet.mkBrowserWallet(supportedWallet);

        // get the address from the contract deployer
        const aliceAddr32 = await bWallet.getChangeAddress();
        // this won't be needed in future releases
        const aliceAddr = unAddressBech32(aliceAddr32);

        const alice: Party = {address: aliceAddr };
        // get address from UI
        const bob: Party = {address: bobAddrRef};
        
        // connect to runtime
        const runtimeLifecycle = await mkRuntimeLifecycle({
            walletName: supportedWallet,
            runtimeURL: RUNTIME_URL
        });

        // create contract from ./components/SimpleDemoContract.tsx
        const myContract = mkSimpleDemo(amtLovelace, alice, bob);

        // deploy contract, initiate signing
        const [contractId, txnId] = await runtimeLifecycle.contracts.createContract({
            contract: myContract,
        });

        const bintAmount = BigInt(amtLovelace);

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
        const contractConfirm = await bWallet.waitConfirmation(txnId);
        console.log(`Contract creation txn confirmed is: ${contractConfirm}\nTXID(input to Cardanoscan): ${txnId}`);
    
        const txId = await runtimeLifecycle.contracts.applyInputs(contractId, depositRequest);
        const depositConfirm = await bWallet.waitConfirmation(txId)
        console.log(`Txn confirmed: ${depositConfirm}\nHere is your receipt${txId}`);
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
    async function handleSmartGift(amtRef: number, toAddrRef: string){
        setSubmitFlag(true);
        setToAddress(toAddrRef);
        console.log(`The number you entered was: ${amtRef}`);
        const amtLovelace = parseADA(amtRef);
        console.log(`We converted that to ${amtLovelace} lovelace`);
        const supportedWallet: SupportedWalletName = walletChoice as SupportedWalletName;
        const browserWallet = await wallet.mkBrowserWallet(supportedWallet);

        const buyerAddr32: AddressBech32 = await browserWallet.getChangeAddress();
        const buyerAddr = unAddressBech32(buyerAddr32);

        // comes from our wallet connection
        const buyer: Party = { address: buyerAddr};
        // comes from UI
        const receiver: Party = {address: toAddrRef};

        const runtimeLifecycle = await mkRuntimeLifecycle({
            walletName: supportedWallet,
            runtimeURL: RUNTIME_URL,
        });

        const sGiftContract = mkSmartGift(amtLovelace, buyer, receiver);

        // ctcID = [ctcID, txnhash]
        const [ctcID, txnID] = await runtimeLifecycle.contracts.createContract({
            contract: sGiftContract,
        });
        setCtcGift(ctcID);
        
        const bintAmount = BigInt(amtLovelace);

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

        const contractConfirm: boolean = await browserWallet.waitConfirmation(txnID);
        console.log(`Contract creation txn confirmed is: ${contractConfirm}\nTXID(input to Cardanoscan): ${txnID}`);

        const txId = await runtimeLifecycle.contracts.applyInputs(ctcID, depositRequest);
        const depositConfirm = await browserWallet.waitConfirmation(txId);
        console.log(`Txn confirmed: ${depositConfirm}`);

        console.log(`The contract is waiting for a Choice from the receiver`);
        setChoiceFlag(false);// enable buttons at UI
        // wait for choice from UI
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

    const startSimpleDemo = () => {
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
            {view === views.SIMPLE_DEMO && <SimpleDemo handleSimpleDemo={handleSimpleDemo}/>}
            {view === views.SMART_GIFT && <SmartGift 
                handleSmartGift={handleSmartGift}
                submitFlag={submitFlag}
                choiceFlag={choiceFlag}
                handleChoice0={handleChoice0}
                handleChoice1={handleChoice1}
            />}
        </div>
    );
};

export default App;
