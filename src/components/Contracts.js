import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

export default function Contracts({simpleDemo, demoFlag}) {
    return(
        <Box className="center" sx={{ flexGrow: 1}}>
            <p>
                Welcome to the Marlowe Marketplace. Select a contract below
            </p>
            <Button onClick={simpleDemo} disabled={demoFlag} variant="contained" color="secondary">
                Simple Demo Contract
            </Button>
        </Box>
    );
}