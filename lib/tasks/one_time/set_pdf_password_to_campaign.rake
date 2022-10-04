# frozen_string_literal: true

namespace :one_time do
  task set_pdf_password_to_campaign: :environment do
    Campaign.find_each do |campaign|
      if campaign.update(pdf_password: SecureRandom.hex)
        puts "Add pdf_password for campaign with id #{campaign.id}"
      else
        puts "Failed to add pdf_password for campaign with id #{campaign.id}"
      end
    end
  end
end
