export type AddOnType = "radio" | "checkbox";


export interface AddOn {
    id: number;
    title: string;
    description: string;
    isRequired: boolean;
    options: AddOnOption[]
}
export interface AddOnOption {
    id: number;
    name: string;
    price: number;
    add_on_id: number,
    type: AddOnType;
};



