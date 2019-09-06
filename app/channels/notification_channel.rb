class NotificationChannel < ApplicationCable::Channel
  def subscribed
    stream_from "notification_channel_for_#{current_user.id}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
