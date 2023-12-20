import './index.css';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useRef } from 'react';

export default function SimpleDemo({handleAmount}){
    const amountRef = useRef();
    const bobAddrRef = useRef();
    const sendValue = () => {
        // does this work with lowercase 'number'? 
        handleAmount(Number(amountRef.current.value), bobAddrRef.current.value); 
    };

    return(
            <div className="center">
                This contract takes a deposit from user A and sends it to user B
                <TextField 
                    id="amount"
                    label="deposit amount in ADA"
                    inputRef={amountRef}
                />
                <TextField 
                    id="to-address"
                    label="to address"
                    inputRef={bobAddrRef}
                />
                <Button 
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={sendValue}
                >
                    Submit
                </Button>
            </div>
    );
}