import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

export default function Contracts({ startSimpleDemo, demoFlag }) {
    return(
        <Box className="center" sx={{ flexGrow: 1}}>
            <p>
                Welcome to the Marlowe Marketplace. Select a contract below
            </p>
            <Button onClick={startSimpleDemo} disabled={demoFlag} variant="contained" color="secondary">
                Simple Demo Contract
            </Button>
        </Box>
    );
}
