
export interface PaginationState {
    current_page: number;
    from: number;
    to: number;
    pages: number;
    total: number;
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