declare module 'sharedb-mongo' {
  import { DB } from 'sharedb';
  function ShareDBMongo(connectionString: string): DB;
  export = ShareDBMongo;
}

declare module '@teamwork/websocket-json-stream' {
  import { Duplex } from 'stream';
  import { WebSocket } from 'ws';
  class WebSocketJSONStream extends Duplex {
    constructor(ws: WebSocket);
  }
  export = WebSocketJSONStream;
}
