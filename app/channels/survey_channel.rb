# Be sure to restart your server when you modify this file. Action Cable runs in an EventMachine loop that does not support auto reloading.
class SurveyChannel < ApplicationCable::Channel
  def subscribed
    stream_from 'survey'
  end

  def speak(data)
      ActionCable.server.broadcast('survey',
        message: 'hello',
        notification: {level: 'success', message: 'New Message'})
  end

end
