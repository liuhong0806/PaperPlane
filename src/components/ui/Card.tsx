import { cn } from '@/utils/cn'

export default function Card(props: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-app-line/15 bg-white shadow-[0_18px_50px_-40px_rgb(0_0_0/0.22)]',
        props.className,
      )}
    >
      {props.children}
    </div>
  )
}
