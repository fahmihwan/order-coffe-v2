import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../api/api";
import type { Category } from "../../types/category";
import type { AddOn } from "../../types/addOn";

type ApiResponse<T> = {
    data: T;
    message?: string;
};

type MenuStatus = "idle" | "loading" | "success" | "failed";

type MenuState = {
    menus: Category[];
    addOnOptions: AddOn[];
    message: string;
    status: MenuStatus;
    error?: string;
};

const initialState: MenuState = {
    menus: [],
    addOnOptions: [],
    message: "",
    status: "idle",
    error: undefined,
};
export const getListMenu = createAsyncThunk<Category[], void, { rejectValue: string }>("menu/fetchListMenu", async (_, { rejectWithValue }) => {
    try {
        const response = await apiClient.get<ApiResponse<Category[]>>("/json/listMenu.json");
        return response.data.data ?? [];
    } catch (err: any) {
        return rejectWithValue(err?.message ?? "Failed to fetch menu");
    }
});

export const getAddOnOptionsByMenuId = createAsyncThunk<AddOn[], { menuId: number }, { rejectValue: string }>("menu/getAddOnOptionsByMenuId", async ({ menuId }, { rejectWithValue }) => {

    try {
        const response = await apiClient.get<ApiResponse<AddOn[]>>("/json/listAddOn.json");
        return response.data.data ?? [];

        // kalau JSON-nya semua addon, filter disini:
        // return all.filter((x) => x.menuId === menuId);
    } catch (err: any) {
        return rejectWithValue(err?.message ?? "Failed to fetch add-ons");
    }
});



export const menuSlice = createSlice({
    name: "menu",
    initialState,
    reducers: {
        setMessage: (state, action: PayloadAction<string>) => {
            state.message = action.payload;
        },
        clearMenuError: (state) => {
            state.error = undefined;
        },
        clearAddOns: (state) => {
            state.addOnOptions = [];
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getListMenu.pending, (state) => {
            return (state = { ...state, status: "loading" })
        }).addCase(getListMenu.fulfilled, (state, action) => {

            return (state = {
                ...state,
                menus: action.payload,
                status: "success"
            })
        }).addCase(getListMenu.rejected, (state, action) => {
            return (state = {
                ...state,
                status: "failed",
                error: action.error.message,
            });
        }).addCase(getAddOnOptionsByMenuId.pending, (state) => {
            return (state = { ...state, status: "loading" })
        }).addCase(getAddOnOptionsByMenuId.fulfilled, (state, action) => {

            return (state = {
                ...state,
                addOnOptions: action.payload,
                status: "success"
            })
        }).addCase(getAddOnOptionsByMenuId.rejected, (state, action) => {
            return (state = {
                ...state,
                status: "failed",
                error: action.error.message,
            });
        })
    }
});



export const { setMessage, clearMenuError, clearAddOns } = menuSlice.actions;
export default menuSlice.reducer;