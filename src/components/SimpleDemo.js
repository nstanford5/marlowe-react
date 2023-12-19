import './index.css';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useRef } from 'react';

export default function SimpleDemo({handleAmount}){
    const valueRef = useRef();
    const sendValue = () => { handleAmount(Number(valueRef.current.value)); };

    return(
            <div className="center">
                This contract takes a deposit from user A and sends it to user B

                <TextField 
                    id="amount"
                    label="deposit amount in ADA"
                    inputRef={valueRef}
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