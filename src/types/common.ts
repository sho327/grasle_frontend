import { LucideIcon } from 'lucide-react'

export interface LayoutNavItem {
    href: string
    label: string
    icon: LucideIcon // Lucideアイコン型を共通化したい場合はimport型名指定もOK
}
