# Flags

Demo at [marinm.net/flags](https://marinm.net/flags)

## The Game

![alt text](gameplay.png "Gameplay demo")

The game board is a 24x24 grid of number and flag tiles, turned down (hidden) or up (revealed). There are 96 flag tiles and the rest are number tiles, with the numbers 0-8. A number on a tile indicates how many flags are adjacent to it. For example, a '0' tile has no flags around it; it is surrounded only by other number tiles. A '3' tile has 3 flags adjacent to it, and the rest are number tiles.

The game starts with all tiles "turned down". Players take turns selecting tiles to reveal. On their turn, the player selects a tile and it gets revealed to be either a number or a flag. If it is a number, their turn ends. If it is a flag, the flag gets marked as their point and they can go again.

There is logic and luck to the game. Using the number tiles, and how many flags have already been revealed around each tile, the player can reason about how many flags are left to be revealed around each tile.

The '0' tile is special (and bad!). When a player selects a '0' tile, _all_ adjacent '0' and number tiles are revealed in a cascading way until all revealed '0' tiles have all the numbers around them revealed. (Remember, a '0' tile has no flags around it, only other number tiles). The end result is a big '0' island that usually gives away the position of a lot of flags - for the opponent!

The first player to find 48 flags wins the game.

## Protocol

### Model

There is a central game server that anyone on the Internet can interact with. Anyone connected to the server is called a player.

The game is not time-sensitive; there are no time limits between moves.
