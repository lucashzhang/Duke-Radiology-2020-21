import { createMuiTheme } from '@material-ui/core/styles'

export default createMuiTheme({
    palette: {
        type: 'dark',
        primary: {
            main: '#90caf9',
        },
        surfacePrimary: {
            main: '#555555',
            contrastText: '#FFFFFF'
        },
    }
})