# Common Issues

## 400 Bad Request
Your contract creation request is malformed. Check the types that you are inputting to your Smart Contract.

## 403 Forbidden
The address that is making the request is not allowed to perform that action. You may have incorrectly specified which wallet is interacting with the Smart Contract. TODO -- In this repository connecting a wallet does not yet guarantee that wallet is authorized to interact with the SC. Different browser extensions will have different implementations of this, because of multiple wallet address features.

## 404 not found
The contract cannot be located in the runtime instance -- likely you need to wait for the creation txn to finish confirming.

## Nami wallet not recognized by getInstalledWalletExtensions()
See this [GitHub Discussion](https://github.com/input-output-hk/marlowe-ts-sdk/discussions/140)