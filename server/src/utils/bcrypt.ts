import bcrypt from "bcrypt";

export const hashValue = async (value: string, salt: number = 10) =>
  await bcrypt.hash(value, salt);

export const compareValue = async (value: string, hashedValue: string) =>
  await bcrypt.compare(value, hashedValue);
