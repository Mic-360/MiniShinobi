"use client"

import React from "react"
import { motion } from "framer-motion"

import { cn } from "../../lib/utils"

const animationProps = {
    initial: { "--x": "100%", scale: 0.8 },
    animate: { "--x": "-100%", scale: 1 },
    whileTap: { scale: 0.95 },
    transition: {
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: 1,
        type: "spring",
        stiffness: 20,
        damping: 15,
        mass: 2,
        scale: {
            type: "spring",
            stiffness: 200,
            damping: 5,
            mass: 0.5,
        },
    },
}

export const ShinyButton = React.forwardRef(({ children, className, ...props }, ref) => {
    return (
        <motion.button
            ref={ref}
            className={cn(
                "relative cursor-pointer rounded-lg border border-zinc-800 px-6 py-2 font-medium backdrop-blur-xl transition-shadow duration-300 ease-in-out bg-zinc-900/50 hover:shadow-[0_0_20px_rgba(244,244,245,0.1)]",
                className
            )}
            {...animationProps}
            {...props}
        >
            <span
                className="relative block size-full text-sm tracking-wide text-zinc-400 uppercase font-light"
                style={{
                    maskImage:
                        "linear-gradient(-75deg, white calc(var(--x) + 20%), transparent calc(var(--x) + 30%), white calc(var(--x) + 100%))",
                    WebkitMaskImage:
                        "linear-gradient(-75deg, white calc(var(--x) + 20%), transparent calc(var(--x) + 30%), white calc(var(--x) + 100%))",
                }}
            >
                {children}
            </span>
            <span
                style={{
                    mask: "linear-gradient(white, white) content-box exclude, linear-gradient(white, white)",
                    WebkitMask:
                        "linear-gradient(white, white) content-box exclude, linear-gradient(white, white)",
                    backgroundImage:
                        "linear-gradient(-75deg, rgba(255,255,255,0.1) calc(var(--x) + 20%), rgba(255,255,255,0.5) calc(var(--x) + 25%), rgba(255,255,255,0.1) calc(var(--x) + 100%))",
                }}
                className="absolute inset-0 z-10 block rounded-[inherit] p-px"
            />
        </motion.button>
    )
})

ShinyButton.displayName = "ShinyButton"
