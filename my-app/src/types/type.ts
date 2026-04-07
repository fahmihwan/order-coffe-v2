
export interface PaginationState {
    currentPage: number;
    from: number;
    to: number;
    pages: number;
    total: number;
    limit: number;
};


export interface ParamsPaginate {
    page?: number;
    limit?: number;
};


export interface ApiResponse<T> {
    message: string;
    data: T;
    pagination?: PaginationState;
    meta?: Record<string, unknown>;
};