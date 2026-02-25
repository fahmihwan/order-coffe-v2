
import apiClient from "./api";
import type { Category } from "../types/category";
import type { AxiosError } from "axios";
import type { AddOn } from "../types/addOn";

export const getMenu = async (): Promise<Category[]> => {
    try {
        const response = await apiClient.get<Category>('/json/listMenu.json')
        return response.data?.data;
    } catch (error) {
        throw error as AxiosError; //biar bisa di catch
    }
}

export const getAddOnOptionsByMenuId = async (menuId: number): Promise<AddOn[]> => {
    try {
        const response = await apiClient.get<AddOn>('/json/listAddOn.json')
        return response.data?.data;
    } catch (error) {
        throw error as AxiosError;
    }

}