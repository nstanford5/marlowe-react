import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import './index.css';
import { useRef } from 'react';

export default function SmartGift({handleSmartGift, submitFlag, choiceFlag, handleDonate, handlePurchase}){
    const amountRef = useRef();
    const toAddrRef = useRef();
    // TODO -- add error handling to text fields  
    const sendValue = () => {
        handleSmartGift(Number(amountRef.current.value), toAddrRef.current.value);
    }
    
    return(
        <div className="center">
            This contract allows you purchase a Smart Gift Card. Smart Gift
            Cards take in an amount and an address to send funds to. 
            <p/>
            <TextField 
                id="amount"
                label="deposit amount in ADA"
                inputRef={amountRef}
            />
            <p/>
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
                disabled={submitFlag}
            >
                Submit
            </Button>
            <Button 
                variant="contained"
                color="secondary"
                size="small"
                onClick={handlePurchase}
                disabled={choiceFlag}
            >
                Purchase Item
            </Button>
            <Button 
                variant="contained"
                color="secondary"
                size="small"
                onClick={handleDonate}
                disabled={choiceFlag}
            >
                Donate Gift Card
            </Button>
        </div>
    );
};