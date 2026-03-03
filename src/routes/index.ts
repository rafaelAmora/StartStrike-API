import { Router } from "express";
import { routerUser } from "./controllerRoutes/RoutesUser.js";
import { routerLogin } from "./controllerRoutes/RouterLogin.js";

const router = Router();

router.use("/user", routerUser);
router.use("/login",routerLogin)

export { router };
