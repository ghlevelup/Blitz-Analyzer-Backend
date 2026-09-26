import type { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { authServices } from "./auth.service";
import { envConfig } from "../../config/env";
import { auth } from "../../lib/auth";
import { generateCsrfToken } from "../../middleware/csrf";

// -------------------- CSRF TOKEN --------------------
const getCsrfToken = asyncHandler(async (req: Request, res: Response) => {
  const csrfToken = generateCsrfToken(req, res);
  return sendSuccess(res, {
    data: { csrfToken },
    message: "CSRF token issued",
  });
});

// -------------------- REGISTER --------------------
const registerController = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, contactNumber } = req.body;
  // role is Zod-validated + defaulted to "USER" in auth.schema.ts - reading
  // from req.validated (not req.body) picks up that default, and the schema
  // already rejects anything other than USER/MANAGER (no self-serve ADMIN).
  const role = (req as any).validated?.role ?? "USER";

  const result = role === "MANAGER"
    ? await authServices.registerManager({ name, email, password, contactNumber, role })
    : await authServices.registerUser({ name, email, password, contactNumber, role });

  return sendSuccess(res, {
    statusCode: 201,
    data: result,
    message: " User Account Created Successfully"
  })
});

// -------------------- LOGIN --------------------
const loginController = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { user, setCookieHeaders } = await authServices.loginUser({ email, password })

  // Relay better-auth's real signed session cookie(s) unchanged.
  if (setCookieHeaders.length > 0) {
    res.setHeader("Set-Cookie", setCookieHeaders);
  }

  return sendSuccess(res, {
    statusCode: 200,
    data: { user },
    message: "your are LoggedIn Sucessfully"
  })
});
// -------------------- PROFILE DATA --------------------
const getUserProfileController = asyncHandler(async (req: Request, res: Response) => {
  const user = await authServices.getCustomerProfile(res.locals.auth)
  return sendSuccess(res, {
    data: user,
    message: "Profile Data fetch Successfully"
  })
});
// -------------------- LOGOUT --------------------
const logoutUserController = asyncHandler(async (req: Request, res: Response) => {

  // signOut deletes the session row in Postgres and clears the cookie,
  // so the session is actually revoked, not just removed from the browser
  const { headers } = await auth.api.signOut({
    headers: fromNodeHeaders(req.headers),
    returnHeaders: true,
  });

  const clearedCookies = headers.getSetCookie?.() ?? [];
  if (clearedCookies.length > 0) {
    res.setHeader("Set-Cookie", clearedCookies);
  }

  return sendSuccess(res, {
    statusCode: 200,
    message: "User Logout Successfully"
  })
});
// -------------------- CHANGE PASSWORD --------------------
const changePasswordController = asyncHandler(async (req: Request, res: Response) => {

console.log(req.body);


  const better_auth_session_token = req.cookies["better-auth.session_token"];

  const { currentPassword, newPassword } = req.body

  const user = await authServices.changePassword({
    sessionToken: better_auth_session_token,
    currentPassword,
    newPassword
  })

  console.log("ssuccess");
  
  return sendSuccess(res, {
    statusCode: 200,
    data: user,
    message: "Password change Successfully"
  })
});
// -------------------- REQUEST FOR RESET PASSWORD MAIL --------------------
const requestPasswordResetController = asyncHandler(async (req: Request, res: Response) => {

  const { email } = req.body;


  const result = await authServices.requestResetPassword(email)

  return sendSuccess(res, {
    statusCode: 201,
    message: "Reset Password Link successFully send; Check Index",
  })
});
// --------------------  RESET PASSWORD MAIL --------------------
const resetPasswordController = asyncHandler(async (req: Request, res: Response) => {

  const { newPassword } = req.body;
  const { token } = req.query

  const result = await authServices.resetPassword(newPassword, token as string)
  return sendSuccess(res, {
    statusCode: 201,
    message: "Your Reset Password  successFully",
  })
});

// --------------------  VERIFY EMAIL --------------------
const verifyEmail = asyncHandler(async (req, res) => {

  const {email,otp} = req.body;
  const result = await authServices.verifyEmail({email,otp})


   return sendSuccess(res,{
    message:"Your email verification is successfull",
    statusCode:200
   })
 
})
// -------------------- SEND OTP  --------------------
const resendOtp = asyncHandler(async (req, res) => {

  const {email,verificationType} = req.body;

   await authServices.resendOtp(email,verificationType)

   return sendSuccess(res,{
 message: "OTP resent successfully" 
   })
 
})
// --------------------  CHANGE AVATAR --------------------
const changeProfileAvatar = asyncHandler(async (req, res) => {
        const payload = {
          profileAvatarUrl:req.body.profileAvatar,
          userId:res.locals.auth.userId,
        };
        console.log(payload);
        
        const updatedResult = await authServices.changeAvatar(payload.profileAvatarUrl,payload.userId)
        console.log("chnage both");
        
        return sendSuccess(res,{
          data:updatedResult,
          message:"Your Profile Avatar Change Successfully"
        })
})
// --------------------  UPDATE PROFILE --------------------
const updateProfileInfo = asyncHandler(async (req, res) => {
  
         const userId =res.locals.auth.userId
        
        const updatedResult = await authServices.updateProfile(req.body,userId)
        return sendSuccess(res,{
          data:updatedResult,
          message:"Your Profile Updated Successfully"
        })
})



// --------------------  LOGIN WITH GOOGLE --------------------
// Uses better-auth's own native social sign-in (auth.api.signInSocial) —
// it already handles the OAuth redirect, state/PKCE, token exchange, and
// session-cookie creation correctly. callbackURL points back at our own
// /google/success route so we can create the app-specific CustomerProfile
// row on first sign-in; errorCallbackURL sends failures straight to the
// frontend sign-in page instead of round-tripping through our backend.
const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const redirectPath = (req.query.redirect as string) || "/dashboard";
  const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
  const encodedRedirectPath = encodeURIComponent(isValidRedirectPath ? redirectPath : "/dashboard");

  const result = await auth.api.signInSocial({
    body: {
      provider: "google",
      callbackURL: `${envConfig.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`,
      errorCallbackURL: `${envConfig.CLIENT_URL}/sign-in?error=oauth_failed`,
    },
  });

  return sendSuccess(res, {
    data: { url: result.url },
    message: "Google auth URL generated",
  });
});

const googleLoginSuccess = asyncHandler(async (req: Request, res: Response) => {
  const redirectPath = req.query.redirect as string || "/dashboard";

  // better-auth's own OAuth flow already set the session cookie before
  // redirecting here, we just need to confirm it and create the profile
  const { response: session } = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
    returnHeaders: true,
  });

  if (!session?.user) {
    return res.redirect(`${envConfig.CLIENT_URL}/sign-in?error=no_session_found`);
  }

  await authServices.googleLoginSuccess(session);

  // ?redirect=//profile -> /profile
  const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
  const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";

  res.redirect(`${envConfig.CLIENT_URL}${finalRedirectPath}`);
});



export const authControllers = {
  getCsrfToken,
  registerController, loginController, getUserProfileController, logoutUserController,
  changePasswordController,
  requestPasswordResetController, resetPasswordController,
  verifyEmail,
  updateProfileInfo,changeProfileAvatar,
  resendOtp,
  googleLoginSuccess,
  googleLogin,
};
