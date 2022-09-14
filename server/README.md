# Flags game server

A Node.js websocket server

---

## Protocol

This is a JSON protocol.

1. WebSockets connection successfully established between client and server
2. Client waits for server to send first packet
3. On connection, server sends first packet

### Server messages

All server messages have a `type`:

```
SERVER

{
    "type"      : "type-name",
    ...
}
```


#### Types

- `join`
- `start`
- `reveal`
- `opponent-disconnected`


#### Examples

```
SERVER

{
    "type"       : "join",
    "status"     : "BUSY"
}
```

```
SERVER

{
    "type"       : "join",
    "status"     : "OPEN",
    "playing_as" : 0
}
```

```
SERVER

{
    "type"       : "start"
}
```

````
SERVER

{
    "type"       : "opponent-disconnected"
}
````

````
SERVER

{
    "type"  : "reveal",
    "for"   : {
                  "i" : 0,
                  "j" : 0
              },
    "score" : {
                  "0"   : 0,
                  "1"   : 0,
                  "seq" : 0,
                  "on"  : true
              },
    "show"  : [
                  {
                      "i"     : 0,
                      "j"     : 0,
                      "value" : 0,
                      "owner" : 0
                  },
                  ...
              ]
}
````

### Client messages

All client messages have a `type`:

```
CLIENT

{
    "type"      : "type-name",
    ...
}
```

#### List of all types

- `select`

#### Examples

```
CLIENT

{
    "select"   : "select",
    "i"        : 0,
    "j"        : 0
}
```