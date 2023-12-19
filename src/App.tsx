import './App.css';
import React from 'react';
import { useState } from 'react';
import { views } from './utils/constants.js';
import IntroPage from './components/IntroPage.js';
import ButtonAppBar from './components/ButtonAppBar.js';
import Contracts from './components/Contracts.js';
import { mkRuntimeLifecycle } from '@marlowe.io/runtime-lifecycle/browser';
import { SupportedWalletName } from '@marlowe.io/wallet/browser';
import mkSimpleDemo from './components/simple-demo/SimpleDemoContract.tsx';
import { ApplyInputsRequest } from '@marlowe.io/runtime-lifecycle/api';
import { ContractId } from '@marlowe.io/runtime-core';
import * as wallet from '@marlowe.io/wallet';
import { 
    Contract,
    Party,
    lovelace,
    IDeposit,
    Input
} from '@marlowe.io/language-core-v1';

const App: React.FC = () => {
    const [view, setView] = useState(views.INTRO);
    const [walletChoice, setWalletChoice] = useState('');
    const [openModal, setOpenModal] = useState(false);
    // TODO -- fix Snackbar on wallet connection
    const [openSnack, setOpenSnack] = useState(false);
    const handleSnackClose = () => { setOpenSnack(false); };
    const handleOpenModal = () => { setOpenModal(true); }
    const handleCloseModal = () => { setOpenModal(false); }
    const handleWalletChoice = (a: string) => { setWalletChoice(a); }

    const simpleDemo = async () => {
        
        const runtimeURL = 'https://marlowe-runtime-preprod-web.demo.scdev.aws.iohkdev.io';
        // returns walletAPI
        const bWallet = await wallet.mkBrowserWallet((walletChoice as SupportedWalletName));
        
        const runtimeLifecycle = await mkRuntimeLifecycle({
            walletName: (walletChoice as SupportedWalletName),
            runtimeURL
        });
        const myContract: Contract = mkSimpleDemo();

        const ctID = await runtimeLifecycle.contracts.createContract({
            contract: myContract,
        });
        const alice: Party = { address: 'addr_test1qqms53j46dvjxre8pwnq22jtfxak0gn8qaadpwducpmc6kt8vy88dkve8vjaap9d4wgt58n8f58jna69hvh7fxmsva5q99hyur'};
        
        const deposit: IDeposit = {
        input_from_party: alice,
        that_deposits: 5000000000n,
        of_token: lovelace, // where can we find in the documentation the function lovelace
        into_account: alice,
        };

        const inputs: Input[] = [deposit];

        const depositRequest: ApplyInputsRequest = {
        inputs
        };

        // must wait for the contract creation to finalize before deposits are available
        const bConfirm: boolean = await bWallet.waitConfirmation(ctID[1]);
        console.log(bConfirm);
        console.log(runtimeLifecycle);
        if(bConfirm){
            try{
                const txId = await runtimeLifecycle.contracts.applyInputs(ctID[0] as ContractId, depositRequest);
                console.log(`Test complete`);
            } catch(e) {
                console.log(`Error: ${e}`);
            }
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
            />
            {view === views.INTRO && <IntroPage />}
            {view === views.CONTRACTS && <Contracts 
                simpleDemo={simpleDemo}
            />}
        </div>
    );
};

export default App;