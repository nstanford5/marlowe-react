import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import './index.css';
import { useRef, useState } from 'react';

export default function SmartGift({handleSmartGift}){
    const amountRef = useRef();
    const toAddrRef = useRef();
    // TODO -- do I need this?
    const [choiceFlag, setChoiceFlag] = useState(false);
    const [purchaseFlag, setPurchaseFlag] = useState(true);
    const sendValue = () => {
        handleSmartGift(Number(amountRef.current.value), toAddrRef.current.value);
    }
    return(
        <div className="center">
            This contract allows you to designate an address for a specified amount...
            <TextField 
                id="amount"
                label="deposit amount in ADA"
                inputRef={amountRef}
            />
            <TextField 
                id="to-address"
                label="to-address"
                inputRef={toAddrRef}
            />
            <Button 
                variant="contained"
                color="secondary"
                size="small"
                onClick={sendValue}
                // add disabled here
            >
                Submit
            </Button>
            <Button 
                variant="contained"
                color="secondary"
                size="small"
                //onClick={}// TODO
                disabled={purchaseFlag}
            >
                Purchase Item
            </Button>
            <Button 
                variant="contained"
                color="secondary"
                size="small"
                //onClick={}// TODO
                disabled={purchaseFlag}
            >
                Return Gift Card
            </Button>
        </div>
    );
};