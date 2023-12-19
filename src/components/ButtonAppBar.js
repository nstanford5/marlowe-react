import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Snackbar from '@mui/material/Snackbar';
import CloseIcon from '@mui/icons-material/Close';
import { constants, views } from '../utils/constants.tsx';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4
};

function ButtonAppBar({
    walletChoice,
    handleWalletChoice, 
    openModal, 
    handleOpenModal, 
    handleCloseModal,
    openSnack,
    handleSnackClose,
    setOpenSnack,
    setView,
    nami,
    lace,
    eternl
}) {

    const walletCommon = () => {
        setOpenSnack(true);
        handleCloseModal();
        setView(views.CONTRACTS);
    }
    const handleNami = () => {
        walletCommon();
        handleWalletChoice(constants.NAMI);
    }

    const handleLace = () => {
        walletCommon();
        handleWalletChoice(constants.LACE);
    }

    const handleEternl = () => {
        walletCommon();
        handleWalletChoice(constants.ETERNL);
    }

    // Snackbar action
    const action = (
        <React.Fragment>
            <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleSnackClose}
            >
                <CloseIcon fontSize="small" />
            </IconButton>
        </React.Fragment>
    );

    return(
        <Box sx={{ flexGrow: 1}}>
            <AppBar position="static">
                <Toolbar>
                    <Snackbar 
                        open={openSnack}
                        autoHideDuration={3000}
                        onClose={handleSnackClose}
                        message={'Connected with ' + walletChoice + '!'}
                        action={action}
                    />
                    <IconButton 
                        size='large'
                        edge='start'
                        color='inherit'
                        aria-label='menu'
                        sx={{ mr: 2}}
                    >
                    </IconButton>
                    <Typography variant='h6' component='div' sx={{ flexGrow: 1}}></Typography>
                    <Button 
                        color='secondary'
                        variant='contained'
                        onClick={handleOpenModal}
                        disabled={walletChoice == '' ? false : true}
                    >
                        Connect Wallet
                    </Button>
                    <Modal 
                        open={openModal}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                        onClose={handleCloseModal}
                    >
                            <Box sx={style}>
                                <Typography id="modal-modal-title" variant="h6" component="h2">
                                    Connect your Wallet
                                </Typography>
                                <Button variant="contained" disabled={!nami} onClick={handleNami}>Nami</Button>
                                <Button variant="contained" disabled={!eternl} onClick={handleEternl}>Eternl</Button>
                                <Button variant="contained" disabled={!lace} onClick={handleLace}>Lace</Button>
                            </Box>
                    </Modal>
                </Toolbar>
            </AppBar>
        </Box>
    );
}

export default ButtonAppBar;
