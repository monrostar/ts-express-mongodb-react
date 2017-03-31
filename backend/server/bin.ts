import { getServerConfigs } from "./config/env/index";
import MiddlewaresBase = require("./config/middlewares/base/middelwares-base");
import express = require("express");
import http = require("http");
import * as winston from "winston";
import DataAccess = require("./app/dataAccess/data-access");
import Container = require("./container");

const ConsoleLogger = Container.ConsoleLogger;

class Bin {
  protected port : number;
  protected app : express.Application;

  constructor() {
    this.app  = express();
    this.port = Bin.normalizePort(getServerConfigs().port || 3000);
    this.app.set("port", this.port);
    this.init();
  }

  private configureServer() : void {
    this.app.use(MiddlewaresBase.configuration);
  }

  protected init() : void {

    this.configureServer();

    const httpServer = http.createServer(this.app);
    httpServer.listen(this.port);
    httpServer.on("error", this.onError);
    httpServer.on("listening", () => {
      const addr = httpServer.address();
      const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
      ConsoleLogger.log("info", `The worker listens ${bind} to the server`);
    });

    httpServer.once("connection", (stream) => {
      // TODO count users
    });

    winston.log("info", `Worker ${process.pid} started`);

    process.on("SIGINT", () => {
      httpServer.close();
      DataAccess.mongooseInstance((err) => {
        process.exit(err ? 1 : 0);
      });
    });

  }

  private onError(error : any) : void {
    if (error.syscall !== "listen") {
      throw error;
    }

    const bind = typeof this.port === "string" ? `Pipe ${this.port}` : `Port ${this.port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case "EACCES":
        ConsoleLogger.log("error", `${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case "EADDRINUSE":
        ConsoleLogger.log("error", `${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }


  private static normalizePort(val : any) : any {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
      // named pipe
      return val;
    }

    if (port >= 0) {
      // port number
      return port;
    }

    return false;
  }
}

Object.seal(Bin);
export = Bin;
