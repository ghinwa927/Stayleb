import { CashRequest } from "@/components/features/booking/BookingOutcome";
import { BookingProvider } from "@/components/features/booking/BookingContext";
export default function Page(){return <BookingProvider><CashRequest pending /></BookingProvider>;}
