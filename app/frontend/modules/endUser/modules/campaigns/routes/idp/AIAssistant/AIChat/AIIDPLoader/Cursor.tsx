import { motion } from 'motion/react'

export const Cursor = ({ x, y }: { x: number; y: number }) => (
  <motion.path
    d={`M ${x} ${y} L ${x} ${y + 15} L ${x + 5} ${y + 10} L ${x + 10} ${y + 10} L ${x + 3} ${y + 3} Z`}
    fill="var(--ant-primary-color)"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1, x: [0, 2, 0], y: [0, -2, 0] }}
    // eslint-disable-next-line max-len
    transition={{ opacity: { duration: 0.3 }, x: { duration: 0.8, repeat: Infinity }, y: { duration: 0.8, repeat: Infinity } }}
  />
)
