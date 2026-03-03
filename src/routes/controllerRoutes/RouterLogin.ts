import { Router } from "express";
import { ControllerLogin } from "../../controllers/controllerLogin.js";
ControllerLogin

const routerLogin = Router()
const controllerLoginRouter = new ControllerLogin()

routerLogin.post("/",controllerLoginRouter.create)

export {routerLogin}