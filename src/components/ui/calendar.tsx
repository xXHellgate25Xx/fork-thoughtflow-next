import * as React from "react"
import { DayPicker } from "react-day-picker"

import { cn } from 'src/libs/utils/tailwindUtils'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
            }}
            components={{}}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }

