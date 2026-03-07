"use client"

import { cn } from "../../lib/utils"

export function Marquee({
    className,
    reverse = false,
    pauseOnHover = false,
    children,
    vertical = false,
    repeat = 4,
    ...props
}) {
    return (
        <div
            {...props}
            className={cn(
                "group flex gap-4 overflow-hidden p-2 [--duration:40s]",
                {
                    "flex-row": !vertical,
                    "flex-col": vertical,
                },
                className
            )}
        >
            {Array(repeat)
                .fill(0)
                .map((_, i) => (
                    <div
                        key={i}
                        className={cn("flex shrink-0 justify-around gap-4", {
                            "animate-marquee flex-row": !vertical,
                            "animate-marquee-vertical flex-col": vertical,
                            "group-hover:[animation-play-state:paused]": pauseOnHover,
                            "reverse": reverse,
                        })}
                        style={{
                            animationDirection: reverse ? "reverse" : "normal",
                        }}
                    >
                        {children}
                    </div>
                ))}
        </div>
    )
}
