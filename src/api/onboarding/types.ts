
export interface IsEmailPhoneUniqueArgs {
    email: string;
    phone: string;
}

export interface JwtTokenData {
    documentId: string;
    id: string;
}

export interface SendOTPEmailArgs {
    userDocumentId: string;
}