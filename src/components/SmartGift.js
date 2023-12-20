import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import './index.css';
import { useRef } from 'react';

export default function SmartGift({handleSmartGift, submitFlag, choiceFlag, handleChoice0, handleChoice1}){
    const amountRef = useRef();
    const toAddrRef = useRef();    
    const sendValue = () => {
        handleSmartGift(Number(amountRef.current.value), toAddrRef.current.value);
    }
    return(
        <div className="center">
            This contract allows you to designate an address for a specified amount...
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
                onClick={handleChoice1}
                disabled={choiceFlag}
            >
                Purchase Item
            </Button>
            <Button 
                variant="contained"
                color="secondary"
                size="small"
                onClick={handleChoice0}
                disabled={choiceFlag}
            >
                Return Gift Card
            </Button>
        </div>
    );
};