# frozen_string_literal: true

FactoryBot.define do
  factory :meeting_recording do
    meeting_room
    external_id { SecureRandom.uuid }
    status { :finished }
    s3key { 'test/s3/key.mp4' }
  end
end
