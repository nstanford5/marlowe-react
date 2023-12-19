// React && helper imports
import './App.css';
import React from 'react';
import { useState, useEffect } from 'react';
import { views, constants, RUNTIME_URL, MY_NAMI, MY_LACE } from './utils/constants.tsx';
import IntroPage from './components/IntroPage.js';
import ButtonAppBar from './components/ButtonAppBar.js';
import Contracts from './components/Contracts.js';
import SimpleDemo from './components/SimpleDemo.js';
import mkSimpleDemo from './components/SimpleDemoContract.tsx';

// marlowe TS-SDK imports
import { mkRuntimeLifecycle } from '@marlowe.io/runtime-lifecycle/browser';
import { SupportedWalletName } from '@marlowe.io/wallet/browser';
import { ApplyInputsRequest } from '@marlowe.io/runtime-lifecycle/api';
import * as wallet from '@marlowe.io/wallet';
import { Contract, Input, IDeposit, Party, lovelace, Value } from '@marlowe.io/language-core-v1';

const App: React.FC = () => {
    const [view, setView] = useState(views.INTRO);
    const [nami, setNami] = useState(false);
    const [lace, setLace] = useState(false);
    const [eternl, setEternl] = useState(false);
    const [walletChoice, setWalletChoice] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [demoFlag, setDemoFlag] = useState(false);
    const [openSnack, setOpenSnack] = useState(false);
    const handleSnackClose = () => { setOpenSnack(false); };
    const handleOpenModal = () => { setOpenModal(true); }
    const handleCloseModal = () => { setOpenModal(false); }
    const handleWalletChoice = (a: string) => { setWalletChoice(a); }
    let names: string[] = [];
    
    /**
     * Build this for demo
     * Right now this is setup for Nami to Lace with hardcoded addresses
     * 
     * RE-NAME -- function?
     * 
     * 1. connect to runtime
     * 2. create contract txn
     * 3. wait for txn confirmation
     * 4. building inputs
     * 5. Submitting inputs
     */
    async function handleAmount(amt: Value){
        console.log(`The amount you entered is: ${amt}`);
        const supportedWallet: SupportedWalletName = walletChoice as SupportedWalletName;
        // returns walletAPI
        // TODO -- move this to another function
        const bWallet = await wallet.mkBrowserWallet(supportedWallet);

        const myAddr = await bWallet.getChangeAddress();
        console.log(`My Address: ${JSON.stringify(myAddr)}`);
        
        // connect to runtime
        const runtimeLifecycle = await mkRuntimeLifecycle({
            walletName: supportedWallet,
            runtimeURL: RUNTIME_URL
        });

        const alice: Party = MY_LACE;
        const bob: Party = MY_NAMI;

        // create contract from ./components/SimpleDemoContract.tsx
        const myContract: Contract = mkSimpleDemo(amt, alice, bob);

        // deploy contract, intiate signing
        // ctID = [contractId, txn string]
        const ctID = await runtimeLifecycle.contracts.createContract({
            contract: myContract,
        });

        const bintAmount: bigint = amt as bigint;

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
                console.log(`Txn confirmed: ${depositConfirm}`);
            } catch(e) {
                console.log(`Error: ${e}`);
            }
        } else {
            console.log(`The transaction was not confirmed.`);
        }
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

    const simpleDemo = async () => {
        setDemoFlag(true);// do I need this if I'm going to change pages?
        setView(views.SIMPLE_DEMO);
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
                simpleDemo={simpleDemo}
                demoFlag={demoFlag}
            />}
            {view === views.SIMPLE_DEMO && <SimpleDemo handleAmount={handleAmount}/>}
        </div>
    );
};

export default App;