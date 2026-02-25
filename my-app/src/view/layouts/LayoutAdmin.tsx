import { Link, Outlet } from "react-router-dom";
import { useEffect } from "react";

const ADMIN_STYLES: string[] = [
    "/assets/vendors/mdi/css/materialdesignicons.min.css",
    "/assets/vendors/flag-icon-css/css/flag-icon.min.css",
    "/assets/vendors/css/vendor.bundle.base.css",

    "/assets/vendors/jquery-bar-rating/css-stars.css",
    "/assets/vendors/font-awesome/css/font-awesome.min.css",

    "/assets/css/demo_2/style.css",
];

const ADMIN_SCRIPTS: string[] = [
    // vendors/base (biasanya include jQuery + bootstrap bundle, dll)
    "/assets/vendors/js/vendor.bundle.base.js",

    // plugins
    "/assets/vendors/jquery-bar-rating/jquery.barrating.min.js",
    "/assets/vendors/chart.js/Chart.min.js",
    "/assets/vendors/flot/jquery.flot.js",
    "/assets/vendors/flot/jquery.flot.resize.js",
    "/assets/vendors/flot/jquery.flot.categories.js",
    "/assets/vendors/flot/jquery.flot.fillbetween.js",
    "/assets/vendors/flot/jquery.flot.stack.js",

    // template core
    "/assets/js/off-canvas.js",
    "/assets/js/hoverable-collapse.js",
    "/assets/js/misc.js",
    "/assets/js/settings.js",
    "/assets/js/todolist.js",

    // page-specific (dashboard)
    "/assets/js/dashboard.js",
];

function ensureFavicon(href: string): void {
    const existing = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (existing) existing.href = href;
    else {
        const link = document.createElement("link");
        link.rel = "icon";
        link.href = href;
        document.head.appendChild(link);
    }
}

function loadStyle(href: string): void {
    // Jangan dobel
    const exists = document.querySelector<HTMLLinkElement>(
        `link[data-admin-style="${href}"]`
    );
    if (exists) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.adminStyle = href;
    document.head.appendChild(link);
}

function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // Jangan dobel
        const exists = document.querySelector<HTMLScriptElement>(
            `script[data-admin-script="${src}"]`
        );
        if (exists) return resolve();

        const s = document.createElement("script");
        s.src = src;
        s.defer = true; // aman untuk kebanyakan template
        s.dataset.adminScript = src;

        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Gagal load script: ${src}`));

        document.body.appendChild(s);
    });
}

export default function LayoutAdmin(): JSX.Element {
    useEffect(() => {
        let cancelled = false;

        // 1) Apply title + favicon khusus admin (opsional, tapi enak)
        document.title = "Plus Admin";
        ensureFavicon("/assets/images/favicon.png");

        // 2) Load CSS admin (sync)
        ADMIN_STYLES.forEach(loadStyle);

        // 3) Load JS admin (berurutan)
        const run = async () => {
            try {
                for (const src of ADMIN_SCRIPTS) {
                    if (cancelled) return;
                    await loadScript(src);
                }
            } catch (err) {
                console.error(err);
            }
        };

        run();

        // 4) Cleanup saat keluar dari admin:
        //    - remove scripts & styles admin biar tidak mengganggu customer
        return () => {
            cancelled = true;

            ADMIN_SCRIPTS.forEach((src) => {
                const el = document.querySelector<HTMLScriptElement>(
                    `script[data-admin-script="${src}"]`
                );
                el?.remove();
            });

            ADMIN_STYLES.forEach((href) => {
                const el = document.querySelector<HTMLLinkElement>(
                    `link[data-admin-style="${href}"]`
                );
                el?.remove();
            });
        };
    }, []);

    return <Outlet />;
}