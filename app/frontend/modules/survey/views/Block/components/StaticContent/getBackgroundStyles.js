import { REPEAT, NO_REPEAT } from './settings'

const GetBackgroundStyles = {
  run: ({ backgroundColor, backgroundImage, backgroundImageOptions }) => ({
    backgroundColor,
    backgroundImage: backgroundImage && `url(${backgroundImage})`,
    backgroundSize: backgroundImageOptions === REPEAT ? 'unset' : backgroundImageOptions,
    backgroundRepeat: backgroundImageOptions === REPEAT ? REPEAT : NO_REPEAT,
  }),
}

export default GetBackgroundStyles
