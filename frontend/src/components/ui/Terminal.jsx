'use client';

import { motion, useInView } from 'framer-motion';
import {
  Children,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { cn } from '../../lib/utils';

const SequenceContext = createContext(null);

const useSequence = () => useContext(SequenceContext);

const ItemIndexContext = createContext(null);
const useItemIndex = () => useContext(ItemIndexContext);

export const AnimatedSpan = ({
  children,
  delay = 0,
  className,
  startOnView = false,
  ...props
}) => {
  const elementRef = useRef(null);
  const isInView = useInView(elementRef, {
    amount: 0.3,
    once: true,
  });

  const sequence = useSequence();
  const itemIndex = useItemIndex();

  const shouldAnimate = sequence
    ? sequence.sequenceStarted &&
      itemIndex !== null &&
      sequence.activeIndex >= itemIndex
    : startOnView
      ? isInView
      : true;

  return (
    <motion.div
      ref={elementRef}
      initial={{ opacity: 0, y: -5 }}
      animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: -5 }}
      transition={{ duration: 0.3, delay: sequence ? 0 : delay / 1000 }}
      className={cn('grid text-sm font-normal tracking-tight', className)}
      onAnimationComplete={() => {
        if (!sequence) return;
        if (itemIndex === null) return;
        sequence.completeItem(itemIndex);
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const TypingAnimation = ({
  children,
  className,
  duration = 60,
  delay = 0,
  as: Component = 'span',
  startOnView = true,
  ...props
}) => {
  if (typeof children !== 'string') {
    throw new Error('TypingAnimation: children must be a string.');
  }

  const MotionComponent = motion[Component] || motion.span;

  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);
  const elementRef = useRef(null);
  const isInView = useInView(elementRef, {
    amount: 0.3,
    once: true,
  });

  const sequence = useSequence();
  const itemIndex = useItemIndex();
  const hasSequence = sequence !== null;
  const sequenceStarted = sequence ? sequence.sequenceStarted : false;
  const sequenceActiveIndex = sequence ? sequence.activeIndex : null;
  const sequenceCompleteItemRef = useRef(null);
  const sequenceItemIndexRef = useRef(null);

  useEffect(() => {
    sequenceCompleteItemRef.current = sequence ? sequence.completeItem : null;
    sequenceItemIndexRef.current = itemIndex;
  }, [sequence, itemIndex]);

  useEffect(() => {
    let startTimeout = null;

    if (hasSequence && itemIndex !== null) {
      if (sequenceStarted && !started && sequenceActiveIndex === itemIndex) {
        setStarted(true);
      }
    } else if (!startOnView || isInView) {
      startTimeout = setTimeout(() => setStarted(true), delay);
    }

    return () => {
      if (startTimeout !== null) {
        clearTimeout(startTimeout);
      }
    };
  }, [
    delay,
    startOnView,
    isInView,
    started,
    hasSequence,
    sequenceActiveIndex,
    sequenceStarted,
    itemIndex,
  ]);

  useEffect(() => {
    let typingEffect = null;

    if (started) {
      let i = 0;
      typingEffect = setInterval(() => {
        if (i < children.length) {
          setDisplayedText(children.substring(0, i + 1));
          i++;
        } else {
          if (typingEffect !== null) {
            clearInterval(typingEffect);
          }
          const completeItem = sequenceCompleteItemRef.current;
          const currentItemIndex = sequenceItemIndexRef.current;
          if (completeItem && currentItemIndex !== null) {
            completeItem(currentItemIndex);
          }
        }
      }, duration);
    }

    return () => {
      if (typingEffect !== null) {
        clearInterval(typingEffect);
      }
    };
  }, [children, duration, started]);

  return (
    <MotionComponent
      ref={elementRef}
      className={cn('text-sm font-normal tracking-tight', className)}
      {...props}
    >
      {displayedText}
    </MotionComponent>
  );
};

export const Terminal = ({
  children,
  className,
  sequence = true,
  startOnView = true,
}) => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, {
    amount: 0.3,
    once: true,
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const sequenceHasStarted = sequence ? !startOnView || isInView : false;

  const contextValue = useMemo(() => {
    if (!sequence) return null;
    return {
      completeItem: (index) => {
        setActiveIndex((current) =>
          index === current ? current + 1 : current,
        );
      },
      activeIndex,
      sequenceStarted: sequenceHasStarted,
    };
  }, [sequence, activeIndex, sequenceHasStarted]);

  const wrappedChildren = useMemo(() => {
    if (!sequence) return children;
    const array = Children.toArray(children);
    return array.map((child, index) => (
      <ItemIndexContext.Provider
        key={index}
        value={index}
      >
        {child}
      </ItemIndexContext.Provider>
    ));
  }, [children, sequence]);

  const content = (
    <div
      ref={containerRef}
      className={cn(
        'z-0 h-full w-full overflow-hidden rounded-[14px] border border-[var(--border)] bg-[#0d1210] shadow-[var(--shadow-soft)]',
        className,
      )}
    >
      <div className='flex flex-col gap-y-2 border-b border-[var(--border)] bg-[#111713] p-4'>
        <div className='flex flex-row gap-x-2'>
          <div className='h-2 w-2 rounded-full bg-red-400/70'></div>
          <div className='h-2 w-2 rounded-full bg-amber-400/70'></div>
          <div className='h-2 w-2 rounded-full bg-[var(--accent)]'></div>
        </div>
      </div>
      <div className='h-full overflow-auto p-4 font-mono text-[13px] leading-relaxed text-[color:color-mix(in_oklab,var(--text-primary),black_16%)]'>
        <div className='grid gap-y-1'>{wrappedChildren}</div>
      </div>
    </div>
  );

  if (!sequence) return content;

  return (
    <SequenceContext.Provider value={contextValue}>
      {content}
    </SequenceContext.Provider>
  );
};
