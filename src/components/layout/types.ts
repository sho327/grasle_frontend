export type Notification = {
    id: string
    type: 'task' | 'note' | 'calender' | 'fileManagement'
    title: string
    description: string
    timestamp: string
    isRead: boolean
}
export type Notifications = [
    {
        teamId: string
        teamName: string
        notifications: Notification[]
    },
]
export interface NotificationBadgeProps {
    count: number
}

// レイアウト共通の型
export type Team = {
    id: string
    name: string
    emoji?: string
}

// export type NavItem = {
//     href: string
//     label: string
//     icon: any // Lucideアイコン型を共通化したい場合はimport型名指定もOK
// }

export interface TeamParams {
    teamId: string
}
