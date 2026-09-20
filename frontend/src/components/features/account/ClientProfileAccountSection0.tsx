import { LocalImage } from "@/components/ui/LocalImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { RecordStatus } from "@/components/ui/RecordRow";
import { ActionButton, LocalForm } from "@/components/ui/Interactions";

export function ClientProfileAccountSection0() { return <>
<main className={"w-full min-h-screen bg-background flex flex-col justify-center"}><div className={"flex flex-col w-full"}>



<div className={"w-full bg-[#E4ECEE] min-h-[calc(100vh-72px)] py-8 md:py-10"}>
<div className={"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>

<div className={"flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4"}>
<div>
<div className={"flex items-center space-x-2 text-on-surface-variant font-caption text-caption uppercase tracking-wider mb-2"}>
<span>{"Account"}</span>
<Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
<span className={"text-primary font-semibold"}>{"Settings & Identity"}</span>
</div>
<h1 className={"font-headline-lg text-headline-lg text-on-surface"}>{"Account Settings"}</h1>
<p className={"font-body-lg text-body-lg text-on-surface-variant mt-1"}>{"\n            Manage your personal profile, contact information, and security preferences.\n          "}</p>
</div>

<div className={"flex items-center space-x-3 bg-surface-container-lowest px-4 py-2.5 rounded-xl shadow-sm"}>
<div className={"p-2 rounded-lg bg-surface-container text-primary"}>
<Icon name="villa" className="material-symbols-outlined text-[20px]" />
</div>
<div>
<div className={"font-label-sm text-label-sm text-on-surface-variant"}>{"StayLeb History"}</div>
<div className={"font-title-md text-title-md text-on-surface"}>{"3 Mountain & Coastal Stays"}</div>
</div>
</div>
</div>

<div className={"space-y-3 mb-8"}>

<div className={"flex items-center justify-between bg-[#ECFDF5] px-4 py-3.5 rounded-xl shadow-sm transition-all duration-300"} id={"successBanner"}>
<div className={"flex items-center space-x-3"}>
<div className={"p-1 rounded-full bg-[#059669]/10 text-[#059669]"}>
<Icon name="check_circle" className="material-symbols-outlined text-[20px]" />
</div>
<p className={"font-label-md text-label-md text-[#065F46]"}>{"Your profile details were updated successfully."}</p>
</div>
<ActionButton className={"text-[#065F46] hover:opacity-70 transition-opacity"} actionLabel={"close"} aria-label={"close"} hint={"document.getElementById('successBanner').style.display='none'"}>
<Icon name="close" className="material-symbols-outlined text-[18px]" />
</ActionButton>
</div>

<div className={"flex items-start justify-between bg-error-container/60 px-4 py-3.5 rounded-xl shadow-sm"}>
<div className={"flex items-start space-x-3"}>
<div className={"p-1 rounded-full bg-error/10 text-error mt-0.5"}>
<Icon name="error" className="material-symbols-outlined text-[20px]" />
</div>
<div>
<div className={"font-label-md text-label-md text-error"}>{"Profile Verification Notice"}</div>
<p className={"font-body-md text-body-md text-error/90 mt-0.5"}>{"\n                Phone number must match Lebanese format "}<strong>{"+961 XX XXXXXX"}</strong>{" for regional host coordination.\n              "}</p>
</div>
</div>
<span className={"font-caption text-caption px-2 py-1 rounded bg-surface-container-lowest text-error font-medium shadow-sm"}>{"Format Guide"}</span>
</div>
</div>

<div className={"grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"}>

<div className={"lg:col-span-7 flex flex-col space-y-8"}>

<div className={"bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm"}>
<div className={"flex items-center justify-between pb-6 mb-6"}>
<div>
<h2 className={"font-headline-sm text-headline-sm text-on-surface"}>{"Client Profile"}</h2>
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"Update your public identity and direct host contact points."}</p>
</div>
<span className={"font-caption text-caption bg-surface-container px-3 py-1 rounded-full text-on-surface-variant"}>{"\n                ID: SL-70498\n              "}</span>
</div>

<div className={"flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 p-4 rounded-xl bg-surface-container-low mb-6"}>
<div className={"relative group"}>
<div className={"w-20 h-20 rounded-full overflow-hidden shadow-md ring-4 ring-surface-container-lowest"}>
<LocalImage className={"w-full h-full object-cover"} data-alt={"Maya Haddad profile photography, contemporary Mediterranean style portrait, soft natural morning sunlight in outdoor Beirut patio setting"} src={"/images/0c4a61d7c06867d9.jpg"} alt={"Lebanese holiday home"} />
</div>
<div className={"absolute -bottom-1 -right-1 bg-surface-container-lowest p-1 rounded-full shadow"}>
<div className={"w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center"}>
<Icon name="verified" className="material-symbols-outlined text-[13px]" />
</div>
</div>
</div>
<div className={"flex-1 text-center sm:text-left"}>
<div className={"flex flex-wrap items-center justify-center sm:justify-start gap-2"}>
<h3 className={"font-title-md text-title-md text-on-surface"}>{"Maya Haddad"}</h3>
<span className={"font-caption text-caption bg-[#ECFDF5] text-[#059669] px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1"}>
<span className={"w-1.5 h-1.5 rounded-full bg-[#059669]"}></span>{"\n                    Verified Guest\n                  "}</span>
</div>
<p className={"font-caption text-caption text-on-surface-variant mt-1"}>{"Recommended: Square JPG or PNG, max 4MB"}</p>
<div className={"flex items-center justify-center sm:justify-start space-x-3 mt-3"}>
<ActionButton className={"px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-all flex items-center space-x-1.5 shadow-sm"} type={"button"} actionLabel={"photo_camera Change Photo"} aria-label={"photo_camera Change Photo"}>
<Icon name="photo_camera" className="material-symbols-outlined text-[16px]" />
<span>{"Change Photo"}</span>
</ActionButton>
<ActionButton className={"px-3 py-1.5 rounded-lg text-outline hover:text-on-surface font-label-sm text-label-sm transition-colors"} type={"button"} actionLabel={"Remove"} aria-label={"Remove"}>{"\n                    Remove\n                  "}</ActionButton>
</div>
</div>
</div>

<LocalForm className={"space-y-5"} id={"profileForm"}>

<div>
<label className={"block font-label-md text-label-md text-on-surface mb-1.5"} htmlFor={"fullName"}>{"\n                  Full Legal Name\n                "}</label>
<div className={"relative"}>
<input className={"w-full h-11 px-3.5 pl-10 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none shadow-sm transition-all placeholder:text-outline"} id={"fullName"} placeholder={"Your full name"} type={"text"} name={"fullName"} defaultValue={"Maya Haddad"} aria-label={"Your full name"} />
<Icon name="badge" className="material-symbols-outlined absolute left-3 top-3 text-outline text-[18px]" />
</div>
<span className={"font-caption text-caption text-on-surface-variant mt-1 block"}>{"Displayed on verified booking confirmations to Lebanese hosts."}</span>
</div>

<div>
<div className={"flex items-center justify-between mb-1.5"}>
<label className={"block font-label-md text-label-md text-on-surface"} htmlFor={"emailAddr"}>{"Email Address"}</label>
<span className={"inline-flex items-center space-x-1 font-caption text-caption px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-medium"}>
<Icon name="check" className="material-symbols-outlined text-[14px]" />
<span>{"Verified"}</span>
</span>
</div>
<div className={"relative"}>
<input className={"w-full h-11 px-3.5 pl-10 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none shadow-sm transition-all"} id={"emailAddr"} placeholder={"name@example.com"} type={"email"} name={"emailAddr"} defaultValue={"maya.haddad@example.com"} aria-label={"name@example.com"} />
<Icon name="mail" className="material-symbols-outlined absolute left-3 top-3 text-outline text-[18px]" />
</div>
</div>

<div>
<div className={"flex items-center justify-between mb-1.5"}>
<label className={"block font-label-md text-label-md text-on-surface"} htmlFor={"phoneNumber"}>{"Phone Number (Lebanon)"}</label>
<span className={"inline-flex items-center space-x-1 font-caption text-caption px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-medium"}>
<Icon name="call" className="material-symbols-outlined text-[14px]" />
<span>{"WhatsApp Ready"}</span>
</span>
</div>
<div className={"relative"}>
<div className={"absolute left-3 top-2.5 flex items-center space-x-1.5 pr-2"}>
<span className={"text-[18px]"}>{"\ud83c\uddf1\ud83c\udde7"}</span>
<span className={"font-label-md text-label-md text-on-surface-variant font-mono"}>{"+961"}</span>
</div>
<input className={"w-full h-11 pl-24 pr-3.5 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none shadow-sm transition-all"} id={"phoneNumber"} placeholder={"XX XXXXXX"} type={"tel"} name={"phoneNumber"} defaultValue={"70 123 456"} aria-label={"XX XXXXXX"} />
</div>
<span className={"font-caption text-caption text-on-surface-variant mt-1 block"}>{"Hosts coordinate chalet key deliveries and gate pins via this number."}</span>
</div>

<div className={"grid grid-cols-1 sm:grid-cols-2 gap-4"}>
<div>
<label className={"block font-label-md text-label-md text-on-surface mb-1.5"} htmlFor={"primaryLocation"}>{"Primary Location"}</label>
<div className={"relative"}>
<select className={"w-full h-11 px-3.5 pl-10 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none shadow-sm appearance-none cursor-pointer"} id={"primaryLocation"} defaultValue={"Beirut, Lebanon"} aria-label={"primaryLocation"}>
<option>{"Beirut, Lebanon"}</option>
<option>{"Byblos (Jbeil), Lebanon"}</option>
<option>{"Batroun, Lebanon"}</option>
<option>{"Chouf, Lebanon"}</option>
<option>{"Faraya / Kfardebian, Lebanon"}</option>
</select>
<Icon name="location_on" className="material-symbols-outlined absolute left-3 top-3 text-outline text-[18px]" />
<Icon name="expand_more" className="material-symbols-outlined absolute right-3 top-3 text-outline text-[18px] pointer-events-none" />
</div>
</div>
<div>
<label className={"block font-label-md text-label-md text-on-surface mb-1.5"} htmlFor={"preferredLang"}>{"Preferred Language"}</label>
<div className={"relative"}>
<select className={"w-full h-11 px-3.5 pl-10 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none shadow-sm appearance-none cursor-pointer"} id={"preferredLang"} defaultValue={"English (US)"} aria-label={"preferredLang"}>
<option>{"English (US)"}</option>
<option>{"\u0627\u0644\u0639\u0631\u0628\u064a\u0629 (Arabic - Lebanon)"}</option>
<option>{"Fran\u00e7ais (French)"}</option>
</select>
<Icon name="language" className="material-symbols-outlined absolute left-3 top-3 text-outline text-[18px]" />
<Icon name="expand_more" className="material-symbols-outlined absolute right-3 top-3 text-outline text-[18px] pointer-events-none" />
</div>
</div>
</div>

<div className={"pt-4 flex items-center justify-end space-x-3"}>
<ActionButton className={"px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all"} type={"button"} actionLabel={"Cancel"} aria-label={"Cancel"}>{"\n                  Cancel\n                "}</ActionButton>
<ActionButton className={"px-6 py-2.5 rounded-xl bg-primary-container hover:bg-[#115E60] text-on-primary font-label-md text-label-md shadow-sm active:scale-[0.98] transition-all flex items-center space-x-2"} type={"submit"} actionLabel={"save Save Changes"} aria-label={"save Save Changes"}>
<Icon name="save" className="material-symbols-outlined text-[18px]" />
<span>{"Save Changes"}</span>
</ActionButton>
</div>
</LocalForm>
</div>

<div className={"bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm"}>
<div className={"pb-4 mb-4"}>
<h2 className={"font-headline-sm text-headline-sm text-on-surface"}>{"Notification Preferences"}</h2>
<p className={"font-body-md text-body-md text-on-surface-variant"}>{"Configure how StayLeb reaches out for reservations and regional recommendations."}</p>
</div>
<div className={"space-y-4"}>

<label className={"flex items-start justify-between p-4 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-colors cursor-pointer"}>
<div className={"flex items-start space-x-3.5 pr-4"}>
<div className={"p-2 rounded-lg bg-surface-container text-primary mt-0.5"}>
<Icon name="sms" className="material-symbols-outlined text-[20px]" />
</div>
<div>
<div className={"font-label-md text-label-md text-on-surface"}>{"Booking confirmation SMS & WhatsApp alerts"}</div>
<p className={"font-body-md text-body-md text-on-surface-variant mt-0.5"}>{"Instant road directions, chalet gate codes, and host check-in notices."}</p>
</div>
</div>
<input className={"mt-1.5 w-5 h-5 rounded text-primary-container accent-primary-container focus:ring-0 cursor-pointer"} type={"checkbox"} name={"field"} defaultChecked={true} />
</label>

<label className={"flex items-start justify-between p-4 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-colors cursor-pointer"}>
<div className={"flex items-start space-x-3.5 pr-4"}>
<div className={"p-2 rounded-lg bg-surface-container text-primary mt-0.5"}>
<Icon name="local_fire_department" className="material-symbols-outlined text-[20px]" />
</div>
<div>
<div className={"font-label-md text-label-md text-on-surface"}>{"Seasonal chalet discount alerts"}</div>
<p className={"font-body-md text-body-md text-on-surface-variant mt-0.5"}>{"Curated seasonal price drops for ski chalets in Mzaar or summer villas in Batroun."}</p>
</div>
</div>
<input className={"mt-1.5 w-5 h-5 rounded text-primary-container accent-primary-container focus:ring-0 cursor-pointer"} type={"checkbox"} name={"field"} defaultChecked={true} />
</label>

<label className={"flex items-start justify-between p-4 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-colors cursor-pointer"}>
<div className={"flex items-start space-x-3.5 pr-4"}>
<div className={"p-2 rounded-lg bg-surface-container text-primary mt-0.5"}>
<Icon name="rate_review" className="material-symbols-outlined text-[20px]" />
</div>
<div>
<div className={"font-label-md text-label-md text-on-surface"}>{"StayLeb review reminders"}</div>
<p className={"font-body-md text-body-md text-on-surface-variant mt-0.5"}>{"Gentle reminders to review Lebanese family guesthouses after your checkout."}</p>
</div>
</div>
<input className={"mt-1.5 w-5 h-5 rounded text-primary-container accent-primary-container focus:ring-0 cursor-pointer"} type={"checkbox"} name={"field"} />
</label>
</div>
</div>
</div>

<div className={"lg:col-span-5 flex flex-col space-y-8"}>

<div className={"bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm"}>
<div className={"pb-4 mb-4"}>
<span className={"font-caption text-caption text-primary uppercase font-bold tracking-wider"}>{"Credentials"}</span>
<h2 className={"font-headline-sm text-headline-sm text-on-surface mt-1"}>{"Account Status"}</h2>
</div>

<div className={"grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"}>
<div className={"bg-surface-container-low p-3.5 rounded-xl"}>
<span className={"font-caption text-caption text-on-surface-variant block"}>{"Account Role"}</span>
<span className={"font-label-md text-label-md text-primary font-semibold mt-0.5 block"}>{"Client Account"}</span>
</div>
<div className={"bg-surface-container-low p-3.5 rounded-xl"}>
<span className={"font-caption text-caption text-on-surface-variant block"}>{"Member Since"}</span>
<span className={"font-label-md text-label-md text-on-surface font-semibold mt-0.5 block"}>{"June 2024"}</span>
</div>
<div className={"bg-surface-container-low p-3.5 rounded-xl"}>
<RecordStatus className={"font-caption text-caption text-on-surface-variant block"} initial={"Completed"}></RecordStatus>
<span className={"font-label-md text-label-md text-[#059669] font-semibold mt-0.5 block"}>{"3 Verified Stays"}</span>
</div>
</div>

<div className={"relative rounded-xl overflow-hidden p-4 text-on-primary bg-primary mb-6 shadow-sm"}>
<div className={"absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-primary-container/40 blur-xl pointer-events-none"}></div>
<div className={"relative z-10 flex items-center justify-between"}>
<div>
<span className={"font-caption text-caption text-primary-fixed block uppercase tracking-wider"}>{"Last Completed Stay"}</span>
<div className={"font-title-md text-title-md mt-0.5 font-semibold"}>{"Chalet Cedar Heights"}</div>
<div className={"font-caption text-caption text-on-primary/80 mt-0.5 flex items-center space-x-1"}>
<Icon name="pin_drop" className="material-symbols-outlined text-[14px]" />
<span>{"Bcharre, North Lebanon"}</span>
</div>
</div>
<Icon name="cabin" className="material-symbols-outlined text-[32px] text-primary-fixed-dim opacity-80" />
</div>
</div>

<div className={"pt-2"}>
<Link className={"w-full h-11 px-4 rounded-xl bg-surface-container hover:bg-error-container/40 text-on-surface hover:text-error font-label-md text-label-md transition-all flex items-center justify-center space-x-2"} href={"/auth/login"}>
<Icon name="logout" className="material-symbols-outlined text-[18px]" />
<span>{"Sign Out of StayLeb"}</span>
</Link>
</div>
</div>

<div className={"bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm"}>
<div className={"pb-4 mb-4"}>
<div className={"flex items-center space-x-2"}>
<Icon name="lock" className="material-symbols-outlined text-primary text-[22px]" />
<h2 className={"font-headline-sm text-headline-sm text-on-surface"}>{"Security & Password"}</h2>
</div>
<p className={"font-body-md text-body-md text-on-surface-variant mt-1"}>{"Ensure your account uses a secure passphrase."}</p>
</div>
<LocalForm className={"space-y-4"}>

<div>
<label className={"block font-label-md text-label-md text-on-surface mb-1.5"} htmlFor={"currentPass"}>{"Current Password"}</label>
<div className={"relative"}>
<input className={"w-full h-11 px-3.5 pr-10 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none shadow-sm transition-all"} id={"currentPass"} type={"password"} name={"currentPass"} defaultValue={"secretpassword123"} aria-label={"currentPass"} />
<ActionButton className={"absolute right-3 top-3 text-outline hover:text-on-surface"} type={"button"} actionLabel={"visibility"} aria-label={"visibility"}>
<Icon name="visibility" className="material-symbols-outlined text-[18px]" />
</ActionButton>
</div>
</div>

<div>
<label className={"block font-label-md text-label-md text-on-surface mb-1.5"} htmlFor={"newPass"}>{"New Password"}</label>
<div className={"relative"}>
<input className={"w-full h-11 px-3.5 pr-10 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none shadow-sm transition-all placeholder:text-outline"} id={"newPass"} placeholder={"Enter at least 8 characters"} type={"password"} name={"newPass"} aria-label={"Enter at least 8 characters"} />
<ActionButton className={"absolute right-3 top-3 text-outline hover:text-on-surface"} type={"button"} actionLabel={"visibility_off"} aria-label={"visibility_off"}>
<Icon name="visibility_off" className="material-symbols-outlined text-[18px]" />
</ActionButton>
</div>

<div className={"flex items-center space-x-1.5 mt-2"}>
<div className={"h-1.5 flex-1 rounded-full bg-[#059669]"}></div>
<div className={"h-1.5 flex-1 rounded-full bg-[#059669]"}></div>
<div className={"h-1.5 flex-1 rounded-full bg-[#059669]"}></div>
<div className={"h-1.5 flex-1 rounded-full bg-surface-container"}></div>
<span className={"font-caption text-caption text-on-surface-variant ml-1 font-medium"}>{"Strong"}</span>
</div>
</div>

<div>
<label className={"block font-label-md text-label-md text-on-surface mb-1.5"} htmlFor={"confirmPass"}>{"Confirm New Password"}</label>
<div className={"relative"}>
<input className={"w-full h-11 px-3.5 pr-10 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none shadow-sm transition-all placeholder:text-outline"} id={"confirmPass"} placeholder={"Repeat your new password"} type={"password"} name={"confirmPass"} aria-label={"Repeat your new password"} />
<ActionButton className={"absolute right-3 top-3 text-outline hover:text-on-surface"} type={"button"} actionLabel={"visibility_off"} aria-label={"visibility_off"}>
<Icon name="visibility_off" className="material-symbols-outlined text-[18px]" />
</ActionButton>
</div>
</div>

<div className={"pt-3"}>
<ActionButton className={"w-full h-11 px-4 rounded-xl bg-surface-container-high hover:bg-surface-dim text-on-surface font-label-md text-label-md shadow-sm active:scale-[0.98] transition-all flex items-center justify-center space-x-2"} type={"button"} actionLabel={"key Update Password"} aria-label={"key Update Password"}>
<Icon name="key" className="material-symbols-outlined text-[18px]" />
<span>{"Update Password"}</span>
</ActionButton>
</div>
</LocalForm>
</div>

<div className={"p-4 rounded-xl bg-surface-container-low/70 flex items-start space-x-3"}>
<Icon name="verified_user" className="material-symbols-outlined text-primary text-[20px] mt-0.5" />
<p className={"font-caption text-caption text-on-surface-variant leading-relaxed"}>{"\n              StayLeb is a dedicated Lebanese marketplace. Identity data is only shared with authorized hosts once a reservation is accepted.\n            "}</p>
</div>
</div>
</div>
</div>
</div>
</div></main>
</>; }
