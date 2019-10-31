/* eslint-disable import/prefer-default-export */
import Utils from 'rb/utils/Utils'

export const getName = question => `${question.name} ${Utils.stripHTML(question.props.questionText)}`
