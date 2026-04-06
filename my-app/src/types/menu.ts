export interface Menu {
    id: string;           // uuid.UUID -> string
    image?: string;       // omitempty
    name: string;
    description?: string; // *string + omitempty
    price: number;        // float64 -> number
    is_active: boolean;
}


export interface MenuRequest {
    name: string;
    price: string;
    image?: File | null;
    description?: string | null,
    is_active: boolean,
};
