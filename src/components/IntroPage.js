import logo from '../utils/marlowe-logo.svg';

export default function IntroPage() {
    return(
        <div>
            <img src={logo} className="App-logo"/>
            <p>
                React scaffolding for Marlowe DApps
            </p>
            <a 
                className="App-link"
                href="https://docs.marlowe.iohk.io/docs/introduction"
                target="_blank"
                rel="noopener noreferrer"
            >
                Marlowe Docs
            </a>
        </div>
    );
}