import express, { Express } from "express";
import http from "http";
import morgan from "morgan";
import accountRoute from "./routes/accountRoute";
import userRoute from "./routes/userRoute";
import leaveRoute from "./routes/leaveRoute";
import { connectToDatabase } from "./services/database.service";

const router: Express = express();

connectToDatabase()
  .then(() => {
    /** Logging */
    router.use(morgan("dev"));
    /** Parse the request */
    router.use(express.urlencoded({ extended: false }));
    /** Takes care of JSON data */
    router.use(express.json());

    /** RULES OF OUR API */
    router.use((req, res, next) => {
      // set the CORS policy
      res.header("Access-Control-Allow-Origin", "*");
      // set the CORS headers
      res.header(
        "Access-Control-Allow-Headers",
        "origin, X-Requested-With,Content-Type,Accept, Authorization"
      );
      // set the CORS method headers
      if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "GET PATCH DELETE POST");
        return res.status(200).json({});
      }
      next();
    });

    /** Routes */
    router.use("/", accountRoute, userRoute, leaveRoute);

    /** Error handling */
    router.use((req, res, next) => {
      const error = new Error("not found");
      return res.status(404).json({
        message: error.message,
      });
    });

    /** Server */
    const httpServer = http.createServer(router);
    const PORT: any = process.env.PORT || 4000;
    httpServer.listen(PORT, () =>
      console.log(`The server is running on port ${PORT}`)
    );
  })
  .catch((error: Error) => {
    console.error("Database connection failed", error);
    process.exit();
  });
