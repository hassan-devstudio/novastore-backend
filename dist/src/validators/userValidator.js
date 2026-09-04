import * as yup from "yup";
export const registerSchema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters long") // Changed from 6 to 8
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter") // Checks for A-Z [1]
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character",
    ) // Checks for symbols [1]
    .required("Password is required"),
});
export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email address.")
    .required("Email is required."),
  password: yup.string().required("Password is required."),
});
// Schema used when updating the authenticated user's profile
export const profileSchema = yup.object({
  phone: yup.string().trim().optional(),
  address: yup.string().trim().optional(),
  avatar: yup.string().trim().url("Avatar must be a valid URL").optional(),
});

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required("Current password is required"),

  newPassword: yup
    .string()
    .min(8, "New password must be at least 8 characters")
    .matches(/[A-Z]/, "New password must contain an uppercase letter")
    .matches(/[0-9]/, "New password must contain a number")
    .required("New password is required"),
});
