export interface APIResponseDto {
    success: boolean;
    message?: string;
    object?: any;
}

export const APIResponseOk = (message: string, object: any = null): APIResponseDto => {
    return {
        success: true,
        message,
        object
    };
}

export const APIResponseFail = (message: string, object: any = null): APIResponseDto => {
    return {
        success: false,
        message,
        object
    };
}