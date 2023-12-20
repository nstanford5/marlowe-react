import './index.css';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useRef } from 'react';

export default function SimpleDemo({handleAmount}){
    const amountRef = useRef();
    const bobAddrRef = useRef();
    const sendValue = () => {
        handleAmount(Number(amountRef.current.value), bobAddrRef.current.value); 
    };

    return(
            <div className="center">
                This contract takes a deposit from user A and sends it to user B
                <p/>
                <TextField 
                    id="amount"
                    label="deposit amount in ADA"
                    inputRef={amountRef}
                />
                <p/>
                <TextField 
                    id="to-address"
                    label="to address"
                    inputRef={bobAddrRef}
                />
                <p/>
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