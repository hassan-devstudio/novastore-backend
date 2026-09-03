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
