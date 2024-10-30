import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { deleteCookie, setCookie } from "hono/cookie";

import { LoginSchema, RegisterSchema } from "../schemas";

import { createAdminClient } from "@/lib/appwrite";
import { ID } from "node-appwrite";
import { AUTH_COOKIE } from "../constants";
import { SessionMiddleware } from "@/lib/session-middleware";

const app = new Hono()

    .get(
        "/current",
        SessionMiddleware,
        (c) => {
            const user = c.get("user");
            return c.json({ data: user })
        }
    )

    .post(
        "/login", 
        zValidator("json", LoginSchema), 
        async (c) => {
            const { email, password } = c.req.valid("json");
            const { account } = await createAdminClient();

            const session = await account.createEmailPasswordSession(
                email,
                password
            );

            setCookie(c, AUTH_COOKIE, session.secret, {
                path: "/",
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 60 * 60 * 24 * 30
            });

            return c.json({ success: true });
        }
    )

    .post(
        "/register", 
        zValidator("json", RegisterSchema), 
        async (c) => {
            const { name, email, password } = c.req.valid("json");
            const { account } = await createAdminClient();

            await account.create(
                ID.unique(),
                email,
                password,
                name
            );

            const session = await account.createEmailPasswordSession(
                email,
                password
            );

            setCookie(c, AUTH_COOKIE, session.secret, {
                path: "/",
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 60 * 60 * 24 * 30
            });

            return c.json({ success: true });
        }
    )

    .post(
        "/logout",
        SessionMiddleware,
        async (c) => {
            const account = c.get("account");
            deleteCookie(c, AUTH_COOKIE);

            await account.deleteSession("current");

            return c.json({ success: true });
        }
    )

export default app;