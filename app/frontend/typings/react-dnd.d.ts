export * as ReactDnd from 'react-dnd'

declare module 'react-dnd' {
    export const DndProvider: ReactDnd.DndProvider
    export { ReactDnd }
}
