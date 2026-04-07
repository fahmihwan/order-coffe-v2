import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../api/api";
import type { Category, CategoryState, CreateCategoryPayload, UpdateCategoryPayload } from "../../types/category";
import type { ApiResponse, PaginationState, ParamsPaginate } from "../../types/type";



const initialState: CategoryState = {
    masterCategories: [],
    message: "",
    status: "idle",
    error: undefined,
    pagination: null,
};

export const getMasterCategory = createAsyncThunk<
    { data: Category[]; pagination: PaginationState | null; message: string }, ParamsPaginate, { rejectValue: string }
>("category/getAll", async (params, { rejectWithValue }) => {
    try {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 5;

        const response = await apiClient.get<ApiResponse<Category[]>>("/category", {
            params: { page, limit },
        });

        return {
            data: response.data.data ?? [],
            pagination: response.data.pagination ?? null,
            message: response.data.message ?? "Success",
        };
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Failed to fetch categories";
        return rejectWithValue(message);
    }
});

export const createCategory = createAsyncThunk<
    Category,
    CreateCategoryPayload,
    { rejectValue: string }
>("category/create", async (payload, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        formData.append("category_name", payload.categoryName);

        const response = await apiClient.post<ApiResponse<Category>>(
            "/category",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data.data;
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Failed to create category";
        return rejectWithValue(message);
    }
});

export const updateCategory = createAsyncThunk<
    Category,
    UpdateCategoryPayload,
    { rejectValue: string }
>("category/update", async ({ id, data }, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        if (data.categoryName != undefined) {
            formData.append("category_name", data.categoryName);
        }
        const response = await apiClient.put<ApiResponse<Category>>(
            `/category/${id}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data.data;
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Failed to update category";
        return rejectWithValue(message);
    }
});

export const deleteCategory = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>("category/delete", async (id, { rejectWithValue }) => {
    try {
        await apiClient.delete(`/category/${id}`);
        return id;
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Failed to delete category";
        return rejectWithValue(message);
    }
});

export const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {
        setMessage: (state, action: PayloadAction<string>) => {
            state.message = action.payload;
        },
        clearCategoryError: (state) => {
            state.error = undefined;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMasterCategory.pending, (state) => {
                state.status = "loading";
                state.error = undefined;
            })
            .addCase(getMasterCategory.fulfilled, (state, action) => {
                state.status = "success";
                state.masterCategories = action.payload.data;
                state.pagination = action.payload.pagination;
                state.message = action.payload.message;
            })
            .addCase(getMasterCategory.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload ?? "Failed to fetch categories";
            })

            .addCase(createCategory.pending, (state) => {
                state.status = "loading";
                state.error = undefined;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.status = "success";
                state.message = "Category created successfully";
                state.masterCategories.unshift(action.payload);
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload ?? "Failed to create category";
            })

            .addCase(updateCategory.pending, (state) => {
                state.status = "loading";
                state.error = undefined;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.status = "success";
                state.message = "Category updated successfully";
                state.masterCategories = state.masterCategories.map((category) =>
                    category.id === action.payload.id ? action.payload : category
                );
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload ?? "Failed to update category";
            })

            .addCase(deleteCategory.pending, (state) => {
                state.status = "loading";
                state.error = undefined;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.status = "success";
                state.message = "Category deleted successfully";
                state.masterCategories = state.masterCategories.filter(
                    (category) => category.id !== action.payload
                );
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload ?? "Failed to delete category";
            });
    },
});

export const { setMessage, clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;