// React && helper imports
import './App.css';
import React from 'react';
import { useState, useEffect } from 'react';
import { views, constants, RUNTIME_URL } from './utils/constants.tsx';
import IntroPage from './components/IntroPage.js';
import ButtonAppBar from './components/ButtonAppBar.js';
import Contracts from './components/Contracts.js';
// TODO -- merge these two imports
import mkSimpleDemo from './components/SimpleDemoContract.tsx';
import { deposit } from './components/SimpleDemoContract.tsx';

// marlowe TS-SDK imports
import { mkRuntimeLifecycle } from '@marlowe.io/runtime-lifecycle/browser';
import { SupportedWalletName } from '@marlowe.io/wallet/browser';
import { ApplyInputsRequest } from '@marlowe.io/runtime-lifecycle/api';
import { ContractId } from '@marlowe.io/runtime-core';
import * as wallet from '@marlowe.io/wallet';
import { Contract, Input } from '@marlowe.io/language-core-v1';

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

    // we only want this to run once
    useEffect(() => {
        const installedWalletExtensions = wallet.getInstalledWalletExtensions();
        installedWalletExtensions.forEach((i) => names.push(i.name));
        if(names.includes(constants.NAMI)){ setNami(true); }
        if(names.includes(constants.LACE)){ setLace(true); }
        if(names.includes(constants.ETERNL)){ setEternl(true); }
        console.log(`Browser Wallet Extensions: ${names}`);
    }, []);

    /**
     * Build this for demo
     * Right now this is setup for Nami to Lace with hardcoded addresses
     * 
     * 1. connect to runtime
     * 2. create contract txn
     * 3. wait for txn confirmation
     * 4. building inputs
     * 5. Submitting inputs
     */
    const simpleDemo = async () => {
        setDemoFlag(true);
        // returns walletAPI
        const bWallet = await wallet.mkBrowserWallet((walletChoice as SupportedWalletName));
        
        // connect to runtime
        const runtimeLifecycle = await mkRuntimeLifecycle({
            walletName: (walletChoice as SupportedWalletName),
            runtimeURL: RUNTIME_URL
        });
        // create contract from ./components/SimpleDemoContract.tsx
        const myContract: Contract = mkSimpleDemo();

        // deploy contract, intiate signing
        // ctID = [contractId, txn string]
        const ctID = await runtimeLifecycle.contracts.createContract({
            contract: myContract,
        });

        // prepare deposit input
        const inputs: Input[] = [deposit];
        const depositRequest: ApplyInputsRequest = {
        inputs
        };

        // must wait for the contract creation to finalize before deposits are available
        // add something to UI to indicate this
        const bConfirm: boolean = await bWallet.waitConfirmation(ctID[1]);
        console.log(`Contract creation txn confirmed is: ${bConfirm}\nTXID(input to Cardanoscan): ${ctID[1]}`);

        if(bConfirm){
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
        </div>
    );
};

export default App;