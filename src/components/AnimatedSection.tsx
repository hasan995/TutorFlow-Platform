import React, { PropsWithChildren } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

type AnimatedSectionProps = PropsWithChildren<{
  as?: keyof JSX.IntrinsicElements;
  delay?: number;
  className?: string;
  y?: number;
}>;

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  as: Tag = "section",
  children,
  delay = 0,
  className = "",
  y = 16,
}) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const controls = useAnimation();
  const isInView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });

  React.useEffect(() => {
    if (isInView) {
      controls.start({ opacity: 1, y: 0 });
    }
  }, [isInView, controls]);

  return (
    <Tag className={className}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y }}
        animate={controls}
        transition={{ duration: 0.6, ease: "easeOut", delay }}
      >
        {children}
      </motion.div>
    </Tag>
  );
};

export default AnimatedSection;


