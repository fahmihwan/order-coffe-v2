
export const extractErrorMessage = (err: unknown, fallback: string) => {
    if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: unknown }).response === "object" &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
    ) {
        return (err as { response: { data: { message: string } } }).response.data.message;
    }

    if (err instanceof Error) return err.message;
    return fallback;
};
