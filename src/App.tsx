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
    const [toAddress, setToAddress] = useState('');// do I really need a state variable for just this instance?
    const [ctcGift, setCtcGift] = useState<ContractId>();
    const handleSnackClose = () => { setOpenSnack(false); };
    const handleOpenModal = () => { setOpenModal(true); }
    const handleCloseModal = () => { setOpenModal(false); }
    const handleWalletChoice = (a: string) => { setWalletChoice(a); }
    let names: string[] = [];

    // converts ADA to Lovelace
    const parseADA = (num: number) => {
        const lovelace = num * 1000000;
        console.log(`The number you entered is: ${num} ADA\n` +
                            `We converted that to ${lovelace} lovelace`);
        return lovelace; 
    };

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

        handleChoiceSubmit(refundChoice);
    };

    // purchaseChoice handler for Smart Gift Card
    // can I move the handleChoices inside the other SmartGift function?
    // might have trouble with the setState call here
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

        // formulate choice inputs
        const choiceInputs: Input[] = [numChoice];
        const choiceRequest: ApplyInputsRequest = {
            inputs: choiceInputs,
        };

        // make a runtimeLifecycle object so that receiver can apply inputs to SC
        const recRuntimeLifecycle = await mkRuntimeLifecycle({
            walletName: 'lace',// TODO -- remove hardcoded
            runtimeURL: RUNTIME_URL,
        });
        console.log(`Connected receiver address to runtime instance.\nApplying input choice...`);

        const choiceTxn = await recRuntimeLifecycle.contracts.applyInputs(ctcGift as ContractId, choiceRequest);
        console.log(`Choice TXN Receipt: ${choiceTxn}`);
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
        console.log(`The amount you entered is ${amt}`);
        const amtLovelace = amt * 1000000;
        console.log(`We converted that to: ${amtLovelace} lovelace`);
        // connect to runtime instance
        const supportedWallet = walletChoice as SupportedWalletName;
        const bWallet = await wallet.mkBrowserWallet(supportedWallet);

        const aliceAddr32 = await bWallet.getChangeAddress();
        const aliceAddr = unAddressBech32(aliceAddr32);

        const alice: Party = {address: aliceAddr};
        const bob: Party = {address: bobAddrRef};

        const runtimeLifecycle = await mkRuntimeLifecycle({
            walletName: supportedWallet,
            runtimeURL: RUNTIME_URL
        });

        // build the Smart Contract and deploy
        const myContract = mkSimpleDemo(amtLovelace, alice, bob);

        const [contractId, txnId] = await runtimeLifecycle.contracts.createContract({
            contract: myContract,
        });

        // wait for confirmation of that txn
        const contractConfirm = await bWallet.waitConfirmation(txnId);
        // build and submit a deposit
        const bintAmount = BigInt(amtLovelace);

        const deposit: IDeposit = {
            input_from_party: alice,
            that_deposits: bintAmount,
            of_token: lovelace,
            into_account: bob,
        };

        const inputs: Input[] = [deposit];
        const depositRequest: ApplyInputsRequest = {
            inputs
        };

        const txId = await runtimeLifecycle.contracts.applyInputs(contractId, depositRequest);

        // verify the deposit
        const depositConfirm = await bWallet.waitConfirmation(txId);
        console.log(`Txn confirmed: ${depositConfirm}\nHere is your receipt: ${txId}`);
    };

    /**
     * 
     * The steps of this Contract are as follows..
     * SHOP = ETERNL
     * BUYER = NAMI
     * RECEIVER = LACE
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
        // state variables
        setSubmitFlag(true);
        setToAddress(toAddrRef);

        // converting ADA to Lovelace
        const amtLovelace = parseADA(amtRef);

        const supportedWallet = walletChoice as SupportedWalletName;
        const browserWallet = await wallet.mkBrowserWallet(supportedWallet);

        // this won't be necessary soon
        // the problem is here
        const buyerAddr32 = await browserWallet.getChangeAddress();
        const buyerAddr = unAddressBech32(buyerAddr32);

        // comes from our wallet connection with the Dapp
        const buyer: Party = { address: buyerAddr};

        // comes from UI
        const receiver: Party = {address: toAddrRef};

        // set runtimeLifecycle object
        console.log(`Connecting to runtime instance...`);
        const runtimeLifecycle = await mkRuntimeLifecycle({
            walletName: supportedWallet,
            runtimeURL: RUNTIME_URL,
        });

        // create Smart Contract
        const sGiftContract = mkSmartGift(amtLovelace, buyer, receiver);

        // createContract txn
        console.log(`Submitting contract to the blockchain...`);
        const [ctcID, txnID] = await runtimeLifecycle.contracts.createContract({
            contract: sGiftContract,
        });
        setCtcGift(ctcID); 

        // wait for confirmation of createContract txn
        // when checking in Cardanoscan, it will take a few minutes to reflect the txn
        const contractConfirm: boolean = await browserWallet.waitConfirmation(txnID);
        console.log(`Contract creation txn confirmed is: ${contractConfirm}\nTXID(input to Cardanoscan): ${txnID}`);
        
        // format for use in IDeposit
        const bintAmount = BigInt(amtLovelace);

        // from previous demo
        const deposit: IDeposit = {
            input_from_party: buyer,
            that_deposits: bintAmount,
            of_token: lovelace,
            into_account: receiver,
        };

        // formulate deposit, create ApplyInputsRequest
        const depositInputs: Input[] = [deposit];
        const depositRequest: ApplyInputsRequest = {
            inputs: depositInputs
        };

        // apply deposit to our contract ID
        const txId = await runtimeLifecycle.contracts.applyInputs(ctcID, depositRequest);
        const depositConfirm = await browserWallet.waitConfirmation(txId);
        console.log(`Txn confirmed: ${depositConfirm}`);

        console.log(`The contract is waiting for a Choice from the receiver`);
        setChoiceFlag(false);// enable buttons at UI
        // wait for choice from UI
    };

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
    };

    const startSmartGift = () => {
        setGiftFlag(true);
        setView(views.SMART_GIFT);
    };

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
