import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../api/api";
import type { AddOn } from "../../types/addOn";

type ApiResponse<T> = {
    data: T;
    message?: string;
};

type CategoryStatus = "idle" | "loading" | "success" | "failed";

type AddOnState = {
    masterAddOn: AddOn[]
    message: string;
    status: CategoryStatus;
    error?: string;
};

const initialState: AddOnState = {
    masterAddOn: [],
    message: "",
    status: "idle",
    error: undefined,
};


export const getMasterAddOn = createAsyncThunk<AddOn[], void, { rejectValue: string }>("menu/master/addon", async (_, { rejectWithValue }) => {
    try {
        const response = await apiClient.get<ApiResponse<AddOn[]>>("/json/listAddOn.json");
        return response.data.data ?? [];
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch add-ons";
        return rejectWithValue(message);
    }
});


export const addOnSlice = createSlice({
    name: "addOn",
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
        builder.addCase(getMasterAddOn.pending, (state) => {
            return (state = { ...state, status: "loading" })
        }).addCase(getMasterAddOn.fulfilled, (state, action) => {
            return (state = {
                ...state,
                masterAddOn: action.payload,
                status: "success"
            })
        }).addCase(getMasterAddOn.rejected, (state, action) => {
            return (state = {
                ...state,
                status: "failed",
                error: action.error.message,
            });
        })
    }
});



export const { setMessage } = addOnSlice.actions;
export default addOnSlice.reducer;