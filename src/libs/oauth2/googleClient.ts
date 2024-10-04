import { google } from "googleapis";

// Create google oauth2 client
export const oauth2Client = new google.auth.OAuth2({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: process.env.REDIRECT_GOOGLE_OAUTH_URL!,
});

const scopes = ["profile", "email"];

// generate oauth url
export const oauthUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  include_granted_scopes: true,
});

export const oauth2 = google.oauth2({
  auth: oauth2Client,
  version: "v2",
});
