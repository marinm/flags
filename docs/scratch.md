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

So I shouldn't use RSA?