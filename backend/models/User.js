const mongoose = require("mongoose");

const ProviderSchema = new mongoose.Schema(
    {
        enabled: {
            type: Boolean,
            default: false,
        },

        encryptedKey: {
            type: String,
            default: null,
        },

        verified: {
            type: Boolean,
            default: false,
        },

        lastVerified: {
            type: Date,
            default: null,
        },
    },
    {
        _id: false,
    },
);

const UserSchema = new mongoose.Schema(
    {
        googleId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },

        name: {
            type: String,
            required: true,
        },

        picture: {
            type: String,
            default: "",
        },

        providers: {
            gemini: {
                type: ProviderSchema,
                default: () => ({}),
            },

            openai: {
                type: ProviderSchema,
                default: () => ({}),
            },

            openrouter: {
                type: ProviderSchema,
                default: () => ({}),
            },
        },

        settings: {
            defaultProvider: {
                type: String,
                default: "gemini",
            },

            theme: {
                type: String,
                default: "system",
            },
        },

        usage: {
            totalRequests: {
                type: Number,
                default: 0,
            },

            totalTokens: {
                type: Number,
                default: 0,
            },
        },
    },
    {
        timestamps: true,
    },
);

module.exports =
    mongoose.model(
        "User",
        UserSchema,
    );