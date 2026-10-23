import { body } from "express-validator";

/**
 * Validator for updating a creator.
 * @type {Array}
 */
export const updateCreatorValidator = [
    body("name")
        .optional()
        .isString()
        .withMessage("Name must be a string")
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be 2-50 characters"),
    body("bio")
        .optional()
        .isString()
        .withMessage("Bio must be a string")
        .isLength({ min: 0, max: 200 })
        .withMessage("Bio must be 0-200 characters"),
    body("avatarUrl")
        .optional()
        .isURL()
        .withMessage("Avatar URL must be a valid URL"),
    body("coffeePrice")
        .optional()
        .isFloat({ min: 20, max: 500 })
        .withMessage("Coffee price must be between 20 and 500"),
];