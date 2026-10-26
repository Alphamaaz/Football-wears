import { apiForm } from "./api";
import type { User } from "./types";

export async function submitVerification(form: FormData) {
  return apiForm<{ message: string; user: User }>("/users/seller/verification", form);
}
