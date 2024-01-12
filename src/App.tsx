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

// marlowe TS-SDK imports
import { mkRuntimeLifecycle } from '@marlowe.io/runtime-lifecycle/browser';
import { SupportedWalletName } from '@marlowe.io/wallet/browser';
import { ApplyInputsRequest } from '@marlowe.io/runtime-lifecycle/api';
import { getInstalledWalletExtensions, mkBrowserWallet } from '@marlowe.io/wallet';
import { 
    Input, 
    IDeposit, 
    Party, 
    lovelace,
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
    
    async function handleSimpleDemo(amt: number, bobAddrRef: string){
        
        const amtLovelace = parseADA(amt);

        const supportedWallet = walletChoice as SupportedWalletName;
        const browserWallet = await mkBrowserWallet(supportedWallet);
        const aliceAddr = await browserWallet.getChangeAddress();

        const alice: Party = {address: aliceAddr};
        const bob: Party = {address: bobAddrRef};

        // connect to runtime instance
        const runtimeLifecycle = await mkRuntimeLifecycle({
            walletName: supportedWallet,
            runtimeURL: RUNTIME_URL
        });
        console.log(`Connected to runtime instance!`);

        // build the Smart Contract
        const myContract = mkSimpleDemo(amtLovelace, alice, bob);

        // deploy the Smart Contract
        console.log(`Submitting contract to the blockchain...`);
        const [contractId, txnId] = await runtimeLifecycle.contracts.createContract({
            contract: myContract,
            minimumLovelaceUTxODeposit: 3_000_000,
        });
        console.log(`Waiting for confirmation of the txn...`);

        // wait for confirmation of that txn
        const contractConfirm = await browserWallet.waitConfirmation(txnId);
        console.log(`Contract Creation is: ${contractConfirm}`);

        // build the deposit
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

        // submit the deposit
        const txId = await runtimeLifecycle.contracts.applyInputs(contractId, depositRequest);

        // wait for deposit confirmation and check status
        const depositConfirm = await browserWallet.waitConfirmation(txId);
        console.log(`Txn confirmed: ${depositConfirm}\nHere is your receipt: ${txId}`);
    };   

    // we only want this to run once
    useEffect(() => {
        const installedWalletExtensions = getInstalledWalletExtensions();
        installedWalletExtensions.forEach((i) => names.push(i.name));
        if(names.includes(constants.NAMI)){ setNami(true); }
        if(names.includes(constants.LACE)){ setLace(true); }
        if(names.includes(constants.ETERNL)){ setEternl(true); }
        console.log(`Browser Wallet Extensions: ${names}`);
    }, []);

    // for triggering from the UI
    const startSimpleDemo = () => {
        setDemoFlag(true);// do I need this if I'm going to change pages?
        setView(views.SIMPLE_DEMO);
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
            />}
            {view === views.SIMPLE_DEMO && <SimpleDemo handleSimpleDemo={handleSimpleDemo}/>}
        </div>
    );
};

export default App;
