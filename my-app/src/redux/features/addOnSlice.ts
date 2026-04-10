import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../api/api";
import type { AddOn, AddOnOption, AddOnOptionPayload, UpdateAddonOptionPayload } from "../../types/addOn";
import type { ApiResponse, PaginationState, ParamsPaginate } from "../../types/type";
import { extractErrorMessage } from "../../utils/errorUtils";



type CategoryStatus = "idle" | "loading" | "success" | "failed";

type AddOnState = {
    masterAddOns: AddOn[]
    message: string;
    status: CategoryStatus;
    selectedAddOnOption: AddOn | null,
    error: string | null;
    actionLoading: boolean;
    loading: boolean;
    pagination: PaginationState | null;
};

const initialState: AddOnState = {
    masterAddOns: [],
    message: "",
    status: "idle",
    loading: false,
    selectedAddOnOption: null,
    actionLoading: false,
    error: null,
    pagination: null,
};


export const getMasterAddOn = createAsyncThunk<
    { data: AddOn[]; pagination: PaginationState | null }, ParamsPaginate, { rejectValue: string }
>("menu/master/addon", async (params, { rejectWithValue }) => {

    const page = params?.page;
    const limit = params?.limit;


    try {
        const response = await apiClient.get<ApiResponse<AddOn[]>>(
            `/addon-group`, {
            params: { page, limit },
        }
        );

        return {
            data: response.data.data ?? [],
            pagination: {
                currentPage: response.data.pagination?.current_page ?? page,
                from: response.data.pagination?.from ?? 0,
                to: response.data.pagination?.to ?? 0,
                pages: response.data.pagination?.pages ?? 1,
                total: response.data.pagination?.total ?? 0,
                limit,
            },
        };
    } catch (err: unknown) {
        return rejectWithValue(extractErrorMessage(err, "Failed to fetch add-ons"));
    }
});
export const createAddOnOption = createAsyncThunk<
    { data: AddOnOption; message: string },
    AddOnOptionPayload,
    { rejectValue: string }
>("addonoption/create", async (payload, { rejectWithValue }) => {
    try {
        const formData = new FormData();

        formData.append("name", payload.name);
        formData.append("add_on_group_id", payload.add_on_group_id);
        formData.append("price", String(payload.price));
        formData.append("is_active", String(payload.is_active));

        if (payload.type !== undefined) {
            formData.append("type", String(payload.type));
        }

        const response = await apiClient.post<ApiResponse<AddOnOption>>(
            "/addon-option",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return {
            data: response.data.data,
            message: response.data.message ?? "Add On Option created successfully",
        };
    } catch (err: unknown) {
        return rejectWithValue(extractErrorMessage(err, "Failed to create Add On Option"));
    }
});


export const updateAddOnOption = createAsyncThunk<
    { data: AddOnOption; message: string },
    UpdateAddonOptionPayload,
    { rejectValue: string }
>("addonoption/update", async ({ id, payload }, { rejectWithValue }) => {
    try {
        const formData = new FormData();

        formData.append("name", payload.name);
        formData.append("add_on_group_id", payload.add_on_group_id);
        formData.append("price", String(payload.price));
        formData.append("is_active", String(payload.is_active));

        if (payload.type !== undefined) {
            formData.append("type", payload.type);
        }

        const response = await apiClient.put<ApiResponse<AddOnOption>>(
            `/addon-option/${id}`,
            formData,
            { headers: { "Content-Type": "multipart/form-data", }, }
        );

        return {
            data: response.data.data,
            message: response.data.message ?? "Add-on option updated successfully",
        };
    } catch (err: unknown) {
        return rejectWithValue(
            extractErrorMessage(err, "Failed to update add-on option")
        );
    }
});


export const deleteAddOnOption = createAsyncThunk<
    { id: string; message: string },
    string,
    { rejectValue: string }
>("addonoption/delete", async (id, { rejectWithValue }) => {
    try {
        const response = await apiClient.delete<ApiResponse<AddOnOption>>(`/addon-option/${id}`);
        return {
            id,
            message: response.data.message ?? "add on option deleted successfully",
        };
    } catch (err: unknown) {
        return rejectWithValue(extractErrorMessage(err, "Failed to delete add on option"));
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
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMasterAddOn.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMasterAddOn.fulfilled, (state, action) => {
                state.loading = false;
                state.masterAddOns = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getMasterAddOn.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Failed to fetch menu";
            })
            .addCase(createAddOnOption.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
                state.message = "";
            })
            .addCase(createAddOnOption.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.message = action.payload.message;
            })
            .addCase(createAddOnOption.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload ?? "Failed to create menu";
            })

            .addCase(updateAddOnOption.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
                state.message = "";
            })
            .addCase(updateAddOnOption.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.message = action.payload.message;

            })
            .addCase(updateAddOnOption.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload ?? "Failed to update menu";
            })

            .addCase(deleteAddOnOption.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
                state.message = "";
            })
            .addCase(deleteAddOnOption.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.message = action.payload.message;
            })
            .addCase(deleteAddOnOption.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload ?? "Failed to delete menu";
            });

    }
});



export const { setMessage } = addOnSlice.actions;
export default addOnSlice.reducer;