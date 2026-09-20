import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import { ActionButton } from "@/components/ui/Interactions";

export function PublicHomeDiscoverSection1() { return <>
<footer className={"w-full bg-surface-container-lowest mt-space-xl shadow-[0_-1px_6px_rgba(0,0,0,0.03)]"}>
    <div className={"max-w-7xl mx-auto px-margin md:px-margin-md lg:px-margin-lg py-space-xl flex flex-col md:flex-row items-center justify-between gap-space-md"}>
        <div className={"flex items-center gap-space-xs"}>
            <LocalImage alt={"StayLeb Logo"} className={"h-7 w-auto object-contain"} src={"/images/stayleb_brand_logo.png"} />
            <span className={"font-label-md text-label-md text-on-surface-variant"}>{"\u00a9 2024 StayLeb Marketplace. Lebanese Hospitality Defined."}</span>
            </div>
            <div className={"flex items-center gap-space-md"}>
                <Link className={"font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors"} data-path={"discover"} href={"/"}>{"Chalet Catalog"}</Link>
                <ActionButton className={"font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors"} data-path={"host-overview"} actionLabel={"Host Workspace"} aria-label={"Host Workspace"}>{"Host Workspace"}</ActionButton>
                <Link className={"font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors"} data-path={"login"} href={"/auth/login"}>{"Client Portal"}</Link>
                </div>
                </div>
                </footer>
</>; }
