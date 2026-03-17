import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../api/api";
import type { Category } from "../../types/category";

type ApiResponse<T> = {
    data: T;
    message?: string;
};

type CategoryStatus = "idle" | "loading" | "success" | "failed";

type CategoryState = {
    masterCategories: Category[]
    message: string;
    status: CategoryStatus;
    error?: string;
};

const initialState: CategoryState = {
    masterCategories: [],
    message: "",
    status: "idle",
    error: undefined,
};


export const getMasterCategory = createAsyncThunk<Category[], void, { rejectValue: string }>("menu/master/category", async (_, { rejectWithValue }) => {
    try {
        const response = await apiClient.get<ApiResponse<Category[]>>("/json/masterCategories.json");
        return response.data.data ?? [];
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch add-ons";
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
        builder.addCase(getMasterCategory.pending, (state) => {
            return (state = { ...state, status: "loading" })
        }).addCase(getMasterCategory.fulfilled, (state, action) => {
            return (state = {
                ...state,
                masterCategories: action.payload,
                status: "success"
            })
        }).addCase(getMasterCategory.rejected, (state, action) => {
            return (state = {
                ...state,
                status: "failed",
                error: action.error.message,
            });
        })
    }
});



export const { setMessage } = categorySlice.actions;
export default categorySlice.reducer;