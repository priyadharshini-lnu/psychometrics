# frozen_string_literal: true

namespace :one_time do
  desc 'Setup OCI Speech transcription notification infrastructure (topic, subscription, event rules)'
  task oci_speech_transcription_notification_setup: :environment do
    puts "\n Starting OCI Speech Notification Infrastructure Setup..."
    puts '=' * 80

    begin
      OciSpeech::NotificationSetup.call!

      puts "\n#{'=' * 80}"
      puts 'Setup completed successfully!'
      puts "\n The webhook will automatically confirm the subscription when OCI sends the confirmation request."
    rescue StandardError => e
      puts "\n#{'=' * 80}"
      puts "Setup failed: #{e.message}"
      puts "\n Check the logs above for details."
      exit 1
    end
  end
end
