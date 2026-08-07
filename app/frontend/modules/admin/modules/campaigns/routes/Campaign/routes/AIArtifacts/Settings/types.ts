export type Question = {
    id: string
    name: string
    assessmentId: string
    assessmentName: string
    deletedAt?: string | null
}

export type Assessment = {
    id: string
    name: string
    questions: Question[]
}

export type FormItem = {
    id: string
    assessmentId?: string
    questionIds?: string[]
}
