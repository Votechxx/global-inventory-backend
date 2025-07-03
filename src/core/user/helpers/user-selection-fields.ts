import { Prisma } from '@prisma/client';

type selection = Prisma.UserSelect;

export const userPublicFields: selection = {
    email: true,
    firstName: true,
    lastName: true,
    username: true,
    gender: true,
    dob: true,
    phoneNumber: true,
    role: true,
    ProfileImage: true,
    address: true,
};

export const userPrivateFields: selection = {
    dob: true,
    email: true,
    gender: true,
    id: true,
    firstName: true,
    lastName: true,
    username: true,
    ProfileImage: true,
    role: true,
    phoneNumber: true,
    address: true,
    nationality: true,
    qrCode: true,
    city: true,
    zipCode: true,
};

export const userSecretFields: selection = {
    dob: true,
    email: true,
    gender: true,
    id: true,
    firstName: true,
    lastName: true,
    username: true,
    ProfileImage: true,
    role: true,
    appleId: true,
    createdAt: true,
    dateToExpireOtp: true,
    googleId: true,
    isDeleted: true,
    otp: true,
    phoneNumber: true,
    qrCode: true,
    password: true,
    updatedAt: true,
    userCreationMethod: true,
    verified: true,
    address: true,
    city: true,
    zipCode: true,
};
