import { Router } from "express";
import { ControllerUser } from "../../controllers/ControllerUser.js";
import { authenticationHandling } from "../../middlewares/authenticationHandling.js";

const routerUser = Router();
const controllerUserRouter = new ControllerUser();

routerUser.post("/", controllerUserRouter.create);
routerUser.post("/sync-profile", authenticationHandling,controllerUserRouter.syncProfile);
routerUser.post("/sync-matches", authenticationHandling,controllerUserRouter.syncMatches);
routerUser.post("/sync-matchesProfile", authenticationHandling,controllerUserRouter.syncLeetifyMatchesOnProfile);


routerUser.patch("/:id", authenticationHandling,controllerUserRouter.update);

routerUser.get("/me", authenticationHandling,controllerUserRouter.getMe);
routerUser.get("/me-stats", authenticationHandling,controllerUserRouter.getMeStats);
routerUser.get("/me-matches", authenticationHandling,controllerUserRouter.getMeMatches);
routerUser.get("/me-match/:id", authenticationHandling,controllerUserRouter.getMeMatch);

routerUser.get("/comparer-users", authenticationHandling,controllerUserRouter.getUsersStats);

routerUser.get("/me-maps-performance",authenticationHandling,controllerUserRouter.getMeMapsPerformance)

export { routerUser };
