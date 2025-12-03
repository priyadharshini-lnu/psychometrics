export type CampaignAIArtifact = {
    id?: number
    name: string
    code: string
    key: string
    aiAssistant: {
        id: number
        name: string
        assistantOutputSchemaKeys: {
            id: number
            key: string
            description: string
            keyType: string
        }[]
    } | null
}
