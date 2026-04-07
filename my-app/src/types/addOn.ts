export type AddOnType = "radio" | "checkbox";


export interface AddOn {
    id: number;
    title: string;
    description: string;
    is_required: boolean;
    min_select: number,
    max_select: number,
    add_on_options: AddOnOption[]
}

export interface AddOnOption {
    id: number;
    name: string;
    price: number;
    add_on_id: number,
    type: AddOnType;
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