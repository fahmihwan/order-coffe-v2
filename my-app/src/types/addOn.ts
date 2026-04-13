export type AddOnType = "radio" | "checkbox";


export interface AddOnGroup {
    id: string;
    title: string;
    description: string;
    is_required: boolean;
    min_select: number,
    max_select: number,
    add_on_options: AddOnOption[]
    menu_add_on_group_id: string
}

export interface AddOnOption {
    id: string;
    name: string;
    price: number;
    // add_on_id: string,
    type: AddOnType;
    add_on_group_id: string,
    is_active: boolean;
};


export interface AddOnOptionPayload {
    name: string;
    add_on_group_id: string;
    price: number,
    type?: AddOnType
    is_active: boolean,
};

export interface UpdateAddonOptionPayload {
    id: string;
    payload: AddOnOptionPayload;
};