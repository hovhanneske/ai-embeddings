import bcrypt from "bcrypt";

if (!process.env.ADMIN_PASSWORD_HASH) {
  throw new Error("ADMIN_PASSWORD_HASH env variable is required.");
}

export const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH.replaceAll(
  "_DOLLAR_",
  "$"
);

export const checkPassword = async (password: string) => {
  return await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
};
