## Potential FAQs
1. How do I form a deposit?

2. How do I handle choices?
    - How do I setup Bounds?

3. What are the steps to bring a contract over from the playground?
    - Create and simulate in Playground
    - Download as JSON
    - Plug JSON in `./components/SomeContract.tsx`
    - Replace hardcoded data with configurable identifiers from UI components
    - Execute / interact using TS-SDK
    
4. Do I need a runtimeLifecycle object specified for each address that will need to sign txns for the DApp?

## Common Issues

### 400 Bad Request
Your contract creation request is malformed. Check the types that you are inputting to your Smart Contract.

### 403 Forbidden
The address that is making the request is not allowed to perform that action. You may have incorrectly specified which wallet is interacting with the Smart Contract. TODO -- In this repository connecting a wallet does not yet guarantee that wallet is authorized to interact with the SC. Different browser extensions will have different implementations of this, because of multiple wallet address features.

### 404 not found
The contract cannot be located in the runtime instance -- likely you need to wait for the creation txn to finish confirming.

### Nami wallet not recognized by getInstalledWalletExtensions()
See this [GitHub Issue](https://github.com/input-output-hk/marlowe-ts-sdk/issues/141)

### Uncaught runtime errors
#### "name":"SyntaxError" ... Error in $.contract...
There is a syntax error in the creation of your contract. Check the Contract.tsx for syntax errors in the JSON