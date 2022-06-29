# Scratchpad

Shareable match link
https://marinm.net/flags?m=3241311917


When the match is done, what does the URL return?

or... a UUID-type URL that persists in the server
all games are saved?
so the player can return to it?

How do these URL's look?
https://marinm.net/flags?m=32413119174531226020
https://marinm.net/flags?m=3241-3119-1745-3122-6020
https://marinm.net/flags?m=79ea107a540b1be8b042fa6531b98a03
https://marinm.net/flags?m=79ea-107a-540b-1be8-b042-fa65-31b9-8a03


2 concerns:
- enough id's for all matches that will ever be played
- needle in the haystack: make it hard for bad actors to access matches they shouldn't be looking at

if matches are key-protected...
requires user login


Many-player flags

This doesn't make much sense - the match should not be in the public URL namespace


AWS DynamoDB to store game state

Need bots! and tests!

## Distributed / Decentralized

Scenario:
- many un-synchronized game servers
- those servers sometimes share game state with each other
- each player has a public-private key pair to id themselves and sign their game moves
- game server signs the game log and gives it to each player to prove that the game happened

is this unnecessarily complicated for the starting stage?

there are 3 actors in a match:
- the two players
- the game server that decides the board, which is secret from the two players

both players agree to trust the game server

Need to decide on a signing algorithm...
Will probably use OpenSSL for this
Reading:
https://opensource.com/article/19/6/cryptography-basics-openssl-part-2
https://www.thesslstore.com/blog/how-secure-is-rsa-in-an-increasingly-connected-world
https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm

So I shouldn't use RSA?


Using RSA:

Let’s walk through how a digital signature is created. As mentioned before, there is no digital signature without a public and private key pair. When using OpenSSL to create these keys, there are two separate commands: one to create a private key, and another to extract the matching public key from the private one. These key pairs are encoded in base64, and their sizes can be specified during this process.

The private key consists of numeric values, two of which (a modulus and an exponent) make up the public key. Although the private key file contains the public key, the extracted public key does not reveal the value of the corresponding private key.

The resulting file with the private key thus contains the full key pair. Extracting the public key into its own file is practical because the two keys have distinct uses, but this extraction also minimizes the danger that the private key might be publicized by accident.

$ open ssl genpkey -algorithm rsa -out privkey.pem -algorithm rsa 4096

This generates a private-public key pair in privkey.pem

Next, extract the public key

$ openssl rsa -in privkey.pem -outform PEM -pubout -out pubkey.pem

Next, sign myclaim.txt using its SHA256 digest and privkey.pem

$ openssl dgst -sha256 -sign privkey.pem -out claimsignature.sha256 myclaim.txt


Now to verify the digital signature on the receiving end

Decode the base64 file

$ openssl enc -base64 -d -in sign.sha256.base64 -out claimsignature.sha256

Verify the signature

$ openssl dgst -sha256 -verify pubkey.pem -signature sign.sha256 myclaim.txt

this will return OK.


...Where to begin implementing this?



AWS KMS:
Reference:
- https://docs.aws.amazon.com/kms/latest/APIReference/API_GenerateDataKeyPair.html