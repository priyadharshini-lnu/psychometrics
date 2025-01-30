import { includes, toLower, random } from 'lodash'

const { I18n } = window


const handleTranscriptionResults = (transcription: string, randomTextGenerated: string) => {
  const testMessage = sanitize(randomTextGenerated)
  const input = sanitize(transcription)
  return input.includes(testMessage)
}

const sanitize = (text: string) => toLower(text.replace(/[.,\s!?-@'#$%^&*]/g, ''))

const getTranscriptionMessage = (transcribeSupportedLocales) => {
  if (includes(transcribeSupportedLocales, I18n.locale)) {
    return I18n.t('checking_wizard.audio_check.test_message')
  }
  return I18n.t('checking_wizard.audio_check.test_message', { locale: 'en' })
}


function getRandomAudioTestPhrase (phrases : string[]) {
  return I18n.t(`checking_wizard.audio_check.random_phrases.${phrases[random(0, phrases.length - 1)]}`)
}

function getRandomVideoTestPhrase (phrases : string[]) {
  return I18n.t(`checking_wizard.video_check.random_phrases.${phrases[random(0, phrases.length - 1)]}`)
}

export {
  handleTranscriptionResults, getTranscriptionMessage, getRandomAudioTestPhrase, getRandomVideoTestPhrase,
}
