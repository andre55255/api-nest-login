export interface ResultDto {
  sucess: boolean;
  message: string | null;
  object: any | null;
}

export const ResultOk = (message: string = null, object: any = null): ResultDto => {
    return {
        sucess: true,
        message,
        object
    }
}

export const ResultFail = (message: string = null, object: any = null): ResultDto => {
    return {
        sucess: false,
        message,
        object
    }
}