# Flags game server

A Node.js websocket server

---

## Protocol

This is a JSON protocol.

1. WebSockets connection successfully established between client and server
2. Client waits for server to send first packet
3. On connection, server sends first packet

### Overview

#### Client → Server

- `version`
- `join`
- `select`

#### Server → Client

- `version`
- `join`
- `start`
- `reveal`
- `opponent-disconnected`

---

### From the server
All server messages have a `type`:

```
TO CLIENT

{
    "type"      : "type-name",
    ...
}
```


#### Types




#### Examples

```
TO CLIENT

{
    "type"       : "join",
    "status"     : "BUSY"
}
```

```
TO CLIENT

{
    "type"       : "join",
    "status"     : "OPEN",
    "playing_as" : 0
}
```

```
TO CLIENT

{
    "type"       : "start"
}
```

````
TO CLIENT

{
    "type"       : "opponent-disconnected"
}
````

````
TO CLIENT

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

### From the client

All client messages have a `type`:

```
TO SERVER

{
    "type"      : "type-name",
    ...
}
```

#### List of all types



#### Examples

```
TO SERVER

{
    "select"   : "select",
    "i"        : 0,
    "j"        : 0
}
```