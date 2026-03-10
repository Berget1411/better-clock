export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
} & Record<string, unknown>;

export type SessionData = {
  session: {
    activeOrganizationId?: string | null;
  } & Record<string, unknown>;
  user: SessionUser;
} | null;

export type TrpcContext = {
  session: SessionData;
  /** Raw session token cookie value – used for server-side Better Auth API calls */
  sessionToken?: string | null;
};
