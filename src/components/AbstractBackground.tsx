import { motion } from "framer-motion";

const AbstractBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Floating Orbs */}
      <motion.div
        className="absolute top-20 right-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Abstract Shapes */}
      <motion.svg
        className="absolute top-1/4 left-10 w-32 h-32 text-primary/10"
        viewBox="0 0 200 200"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <path
          fill="currentColor"
          d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.8C64.8,56.4,53.8,69,39.8,76.4C25.8,83.8,8.8,86,-7.6,84.8C-24,83.6,-39.4,78.9,-52.8,71.1C-66.2,63.3,-77.6,52.4,-84.8,38.9C-92,25.4,-95,9.3,-93.7,-6.3C-92.4,-21.9,-86.8,-37,-77.4,-49.4C-68,-61.8,-54.8,-71.5,-40.2,-78.5C-25.6,-85.5,-9.6,-89.8,4.7,-97.1C19,-104.4,30.6,-83.6,44.7,-76.4Z"
          transform="translate(100 100)"
        />
      </motion.svg>

      <motion.svg
        className="absolute bottom-1/4 right-16 w-40 h-40 text-primary/8"
        viewBox="0 0 200 200"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        <path
          fill="currentColor"
          d="M39.5,-65.5C50.4,-58.5,58.1,-46.3,65.3,-33.3C72.5,-20.3,79.2,-6.5,79.1,7.2C79,20.9,72.1,34.4,62.8,45.3C53.5,56.2,41.8,64.5,28.5,69.8C15.2,75.1,0.3,77.4,-14.3,75.3C-28.9,73.2,-43.2,66.7,-54.9,56.7C-66.6,46.7,-75.7,33.2,-79.5,18.3C-83.3,3.4,-81.8,-13,-75.8,-27.3C-69.8,-41.6,-59.3,-53.8,-46.2,-60.1C-33.1,-66.4,-17.6,-66.8,-1.7,-64.1C14.2,-61.4,28.6,-72.5,39.5,-65.5Z"
          transform="translate(100 100)"
        />
      </motion.svg>
    </div>
  );
};

export default AbstractBackground;
