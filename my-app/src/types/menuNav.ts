export type MenuName = "master" | "kelola" | null;

export type MenuRefs = React.RefObject<HTMLDivElement | null>;

export type NavLinkItem = {
    type: "link";
    label: string;
    to: string;
};

export type NavGroupItem = {
    type: "group";
    key: Exclude<MenuName, null>;
    label: string;
    items: {
        label: string;
        to: string;
    }[];
};

export type MenuNavItem = NavLinkItem | NavGroupItem;