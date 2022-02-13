import express from "express";
import routes from "./routes";
import { limiterMiddleware } from "./middlewares";

const app = express();

app.use(express.static(`${__dirname}/dist`));
app.use(limiterMiddleware);
app.use("*", routes);

// app.get("*", (req, res) => {
//     res.sendFile(`${__dirname}/dist/index.html`);
// });
export default app;
