
import { Router } from "express";

import { validateRequest } from "../../middleware/validateRequest";
import { authControllers } from "./auth.controller";
import { authSchemas } from "./auth.schema";
import { authMiddleware, roleMiddleware } from "../../middleware/auth-middlewares";
import { authLimiter } from "../../middleware";
import { doubleCsrfProtection, ensureCsrfSessionId } from "../../middleware/csrf";

const router: Router = Router();

// Every route below can either issue or need a CSRF token, so the
// anonymous session-id cookie (used to bind pre-auth tokens, since
// login/register run before a real session cookie exists) is ensured for
// the whole module.
router.use(ensureCsrfSessionId);

router.get("/csrf-token", authControllers.getCsrfToken);

// Not CSRF-protected yet: /register goes through the generic
// serverApi()/useApiMutation relay (frontend/src/lib/serverApi.ts), which
// doesn't currently plumb through custom headers the way auth.services.ts's
// axios-based calls do. Wiring a CSRF token through there means touching
// shared, generically-used infra with callers outside auth - left as a
// deliberate follow-up rather than guessed at here. See auth-plan.md.
router.post(
  "/register",
  authLimiter,
  validateRequest(authSchemas.registerUserSchema),
  authControllers.registerController
);

router.post(
  "/login",
  authLimiter,
  doubleCsrfProtection,
  validateRequest(authSchemas.loginUserSchema),
  authControllers.loginController
);
router.get(
  "/me",
authMiddleware,
 roleMiddleware(["USER","ADMIN","MANAGER"]),
  authControllers.getUserProfileController
);
router.post(
  "/logout",
authMiddleware,
 roleMiddleware(["USER","ADMIN","MANAGER"]),
  doubleCsrfProtection,
  authControllers.logoutUserController
);
router.post(
  "/request-reset-password",
  authLimiter,
  authControllers.requestPasswordResetController
);
router.put(
  "/change-password",
authMiddleware,
 roleMiddleware(["USER","ADMIN","MANAGER"]),
  doubleCsrfProtection,
// validateRequest(authSchemas.changePasswordSchema),
  authControllers.changePasswordController
);
// Not double-submit-CSRF-protected: the reset itself already requires an
// unguessable, out-of-band-emailed token as proof of intent, which is
// itself strong CSRF resistance independent of a double-submit cookie -
// same infra gap as /register above if we want to layer it on anyway.
router.put(
  "/reset-password",
  authControllers.resetPasswordController
);
router.post(
  "/verify-email",
  authControllers.verifyEmail
);
router.post(
  "/resend-otp",
  authLimiter,
  authControllers.resendOtp
);

router.put(
  "/change-avatar",
  authMiddleware,
 roleMiddleware(["USER","ADMIN","MANAGER"]),
  doubleCsrfProtection,
  authControllers.changeProfileAvatar
);
router.put(
  "/update-profile",
  authMiddleware,

 roleMiddleware(["USER","ADMIN","MANAGER"]),
  doubleCsrfProtection,
  authControllers.updateProfileInfo
);

router.get("/google", authControllers.googleLogin);
router.get("/google/success", authControllers.googleLoginSuccess);

export default router;
