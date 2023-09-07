# Flags Game Server

## Play Online

[marinm.net/flags](https://marinm.net/flags)

## Screenshot

_This repo is the game server only_.

_The screenshot below is taken from the separate [web client](https://github.com/marinm/flags-web-client) repo._

![alt text](screenshot.png "Gameplay demo")

## JSON Protocol

### Overview

#### Server → Client

- `version`
- `join`
- `start`
- `reveal`
- `opponent-disconnected`

#### Client → Server

- `version`
- `join`
- `select`

---

### From the server

#### Joining

1. Client opens WebSocket with server
2. Client waits for server to send first packet
3. Client can then send join request

##### Join request rejected

```
TO CLIENT {"type": "join", "status": "BUSY"}
```

##### Join request accepted

```
TO CLIENT {"type": "join", "status": "OPEN", "playing_as" : 0}
```

##### Game starts

```
TO CLIENT {"type": "start"}
```

##### Opponent Disconnected

```
TO CLIENT {"type": "opponent-disconnected"}
```

##### Tiles Revealed

```
TO CLIENT
{
    "type": "reveal",
    "for": {"i" : 0, "j" : 0},
    "score": {"0": 0, "1": 0, "seq": 0, "on": true},
    "show": [{"i": 0, "j": 0, "value": 0, "owner": 0}, ...]
}
```

### From the client

#### Play

##### Join

```
TO SERVER {"type": "join"}
```

##### Select

```
TO SERVER {"type": "select", "i": 0, "j": 0}
```
