import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../api/api";
import type { Category } from "../../types/category";
import type { AddOnGroup } from "../../types/addOn";
import type { Menu, MenuPayload, MenuState, UpdateMenuPayload } from "../../types/menu";
import type { ApiResponse, PaginationState, ParamsPaginate } from "../../types/type";
import { extractErrorMessage } from "../../utils/errorUtils";


const initialState: MenuState = {
    menus: [],
    addOnOptions: [],
    masterMenus: [],
    selectedMenu: null,
    loading: false,
    actionLoading: false,
    status: "idle",
    error: null,
    message: "",
    pagination: null,
};


// list all menu and menu pagination 
export const getMasterMenu = createAsyncThunk<{ data: Menu[]; pagination: PaginationState | null, message: string }, ParamsPaginate, { rejectValue: string }>("menu/master/admin", async (params, { rejectWithValue }) => {
    try {
        const page = params?.page;
        const limit = params?.limit;

        const response = await apiClient.get<ApiResponse<Menu[]>>(`/menu`, {
            params: { page, limit },
        });

        return {
            data: response.data.data ?? [],
            pagination: response.data.pagination ?? null,
            message: response.data.message ?? "Success",
        };
    } catch (err: unknown) {
        return rejectWithValue(extractErrorMessage(err, "Failed to fetch menu"));
    }
});



export const getMenuById = createAsyncThunk<Menu, string, { rejectValue: string }>("menu/getById", async (id, { rejectWithValue }) => {
    try {
        const response = await apiClient.get<ApiResponse<Menu>>(`/menu/${id}`);
        return response.data.data;
    } catch (err: unknown) {
        return rejectWithValue(extractErrorMessage(err, "Failed to fetch menu detail"));
    }
});


export const createMenu = createAsyncThunk<{ data: Menu; message: string }, MenuPayload, { rejectValue: string }>("menu/create", async (payload, { rejectWithValue }) => {
    try {
        const formData = new FormData();

        formData.append("name", payload.name);
        formData.append("price", String(payload.price));

        if (payload.description != null && payload.description !== "") {
            formData.append("description", payload.description);
        }

        formData.append("is_active", String(payload.is_active));


        if (payload.image) {
            formData.append("image", payload.image);
        }

        const response = await apiClient.post<ApiResponse<Menu>>("/menu", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return {
            data: response.data.data,
            message: response.data.message ?? "Menu created successfully",
        };
    } catch (err: unknown) {
        return rejectWithValue(extractErrorMessage(err, "Failed to create menu"));
    }
});

export const updateMenu = createAsyncThunk<{ data: Menu; message: string }, UpdateMenuPayload, { rejectValue: string }>("menu/update", async ({ id, payload }, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        console.log(payload.is_active);

        formData.append("name", payload.name);
        formData.append("price", String(payload.price));

        if (payload.description != null && payload.description !== "") {
            formData.append("description", payload.description);
        }

        formData.append("is_active", String(payload.is_active));


        if (payload.image) {
            formData.append("image", payload.image);
        }


        const response = await apiClient.put<ApiResponse<Menu>>(`/menu/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return {
            data: response.data.data,
            message: response.data.message ?? "Menu updated successfully",
        };
    } catch (err: unknown) {
        return rejectWithValue(extractErrorMessage(err, "Failed to update menu"));
    }
});

export const deleteMenu = createAsyncThunk<{ id: string; message: string }, string, { rejectValue: string }>("menu/delete", async (id, { rejectWithValue }) => {
    try {
        const response = await apiClient.delete<ApiResponse<null>>(`/menu/${id}`);
        return {
            id,
            message: response.data.message ?? "Menu deleted successfully",
        };
    } catch (err: unknown) {
        return rejectWithValue(extractErrorMessage(err, "Failed to delete menu"));
    }
});


// list all menu and menu pagination 
export const getMenuAddOn = createAsyncThunk<{ data: Menu[]; pagination: PaginationState | null, message: string }, ParamsPaginate, { rejectValue: string }>("menu/add-on-groups/add-on-options", async (params, { rejectWithValue }) => {
    try {
        const page = params?.page;
        const limit = params?.limit;

        const response = await apiClient.get<ApiResponse<Menu[]>>(`/menu-addon`, {
            params: { page, limit },
        });

        return {
            data: response.data.data ?? [],
            pagination: response.data.pagination ?? null,
            message: response.data.message ?? "Success",
        };
    } catch (err: unknown) {
        return rejectWithValue(extractErrorMessage(err, "Failed to fetch menu"));
    }
});




// =====
export const getListMenu = createAsyncThunk<Category[], void, { rejectValue: string }>("menu/fetchListMenu", async (_, { rejectWithValue }) => {
    try {
        const response = await apiClient.get<ApiResponse<Category[]>>(
            "/json/listMenu.json"
        );
        return response.data.data ?? [];
    } catch (err: unknown) {
        return rejectWithValue(extractErrorMessage(err, "Failed to fetch menu list"));
    }
});

export const getAddOnOptionsByMenuId = createAsyncThunk<AddOnGroup[], { menuId: number }, { rejectValue: string }>("menu/getAddOnOptionsByMenuId", async ({ menuId }, { rejectWithValue }) => {
    try {
        const response = await apiClient.get<ApiResponse<AddOnGroup[]>>(
            "/json/listAddOn.json"
        );

        const allAddOns = response.data.data ?? [];

        // If needed:
        // return allAddOns.filter((item) => item.menuId === menuId);

        return allAddOns;
    } catch (err: unknown) {
        return rejectWithValue(extractErrorMessage(err, "Failed to fetch add-ons"));
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
            state.error = null;
        },
        clearAddOns: (state) => {
            state.addOnOptions = [];
        },
        clearSelectedMenu: (state) => {
            state.selectedMenu = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAddOnOptionsByMenuId.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getAddOnOptionsByMenuId.fulfilled, (state, action) => {
                state.status = "success";
                state.addOnOptions = action.payload;
            })
            .addCase(getAddOnOptionsByMenuId.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload ?? "Failed to fetch add-ons";
            })
            .addCase(getMasterMenu.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMasterMenu.fulfilled, (state, action) => {
                state.loading = false;
                state.masterMenus = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getMasterMenu.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Failed to fetch menu";
            })

            .addCase(getMenuById.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(getMenuById.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.selectedMenu = action.payload;
            })
            .addCase(getMenuById.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload ?? "Failed to fetch menu detail";
            })

            .addCase(createMenu.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
                state.message = "";
            })
            .addCase(createMenu.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.message = action.payload.message;
            })
            .addCase(createMenu.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload ?? "Failed to create menu";
            })

            .addCase(updateMenu.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
                state.message = "";
            })
            .addCase(updateMenu.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.message = action.payload.message;
                state.selectedMenu = action.payload.data;
            })
            .addCase(updateMenu.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload ?? "Failed to update menu";
            })

            .addCase(deleteMenu.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
                state.message = "";
            })
            .addCase(deleteMenu.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.message = action.payload.message;
                state.masterMenus = state.masterMenus.filter(
                    (item) => String(item.id) !== action.payload.id
                );
            })
            .addCase(deleteMenu.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload ?? "Failed to delete menu";
            })
            .addCase(getMenuAddOn.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getMenuAddOn.fulfilled, (state, action) => {
                state.status = "success";
                state.masterMenus = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getMenuAddOn.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload ?? "Failed to fetch menu list";
            })
            .addCase(getListMenu.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getListMenu.fulfilled, (state, action) => {
                state.status = "success";
                state.menus = action.payload;
            })
            .addCase(getListMenu.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload ?? "Failed to fetch menu list";
            })
    },
});

export const {
    setMessage,
    clearMenuError,
    clearAddOns,
    clearSelectedMenu,
} = menuSlice.actions;

export default menuSlice.reducer;