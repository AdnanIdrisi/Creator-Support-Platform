import { body } from "express-validator";

export const createOrderValidator = [
  body("username")
    .notEmpty()
    .withMessage("Username is required"),
  body("supporterName")
    .notEmpty()
    .withMessage("Supporter name is required"),
  body("supporterEmail")
    .isEmail()
    .withMessage("Supporter email is required and must be a valid email"),
  body("message")
    .optional()
    .isString()
    .withMessage("Message must be a string"),
  body("coffees")
    .isInt({ min: 1, max: 5 })
    .withMessage("Coffees must be an integer between 1 and 5"),
];
