"use client"

import { cn } from "../../lib/utils"

export const BentoGrid = ({ children, className, ...props }) => {
    return (
        <div
            className={cn(
                "grid w-full auto-rows-[22rem] grid-cols-3 gap-4",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

export const BentoCard = ({
    name,
    className,
    background,
    Icon,
    description,
    href,
    cta,
    ...props
}) => (
    <div
        key={name}
        className={cn(
            "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
            "bg-zinc-900 border border-zinc-800 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/80",
            className
        )}
        {...props}
    >
        <div className="absolute inset-0">{background}</div>
        <div className="p-6 relative z-10 flex flex-col h-full justify-between">
            <div className="pointer-events-none transform-gpu transition-all duration-300 group-hover:-translate-y-2">
                {Icon && <Icon className="h-10 w-10 origin-left text-zinc-500 transition-all duration-300 ease-in-out group-hover:scale-75 mb-2" />}
                <h3 className="text-xl font-bold text-white">
                    {name}
                </h3>
                <p className="max-w-xs text-zinc-400 text-sm mt-1">{description}</p>
            </div>

            <div className="flex w-full translate-y-2 transform-gpu flex-row items-center transition-all duration-300 group-hover:translate-y-0">
                <a
                    href={href}
                    className="text-emerald-400 text-sm font-medium flex items-center gap-1 hover:text-emerald-300"
                >
                    {cta}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </a>
            </div>
        </div>
        <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-zinc-800/10" />
    </div>
)
