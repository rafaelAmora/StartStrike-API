import { Router } from "express";
import { ControllerUser } from "../../controllers/ControllerUser.js";
import { authenticationHandling } from "../../middlewares/authenticationHandling.js";

const routerUser = Router();
const controllerUserRouter = new ControllerUser();

routerUser.post("/", controllerUserRouter.create);
routerUser.post("/sync-profile", authenticationHandling,controllerUserRouter.syncProfile);
routerUser.post("/sync-matches", authenticationHandling,controllerUserRouter.syncMatches);
routerUser.post("/sync-matchesProfile", authenticationHandling,controllerUserRouter.syncLeetifyMatchesOnProfile);

export { routerUser };
