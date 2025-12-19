# frozen_string_literal: true

namespace :yoodli_reports do
  task daily_import: :environment do
    date = ENV.fetch('DATE', nil)
    result = Yoodli::ImportFromS3Service.call(date: date)

    puts 'Import completed:'
    puts "Files processed: #{result[:files_processed]}"
    puts "Users processed: #{result[:processed_users]}"
    puts "Success: #{result[:success]}"

    if result[:errors].any?
      puts 'Errors:'
      result[:errors].each { |error| puts "  - #{error}" }
    end
  end
end
