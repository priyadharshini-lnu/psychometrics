# frozen_string_literal: true

module WorkshopInvites
  class ImportSubjects < BaseCommand
    def initialize(campaign_id, file)
      @campaign = Campaign.find(campaign_id)
      @file = file
    end

    def call
      rows = read_file.to_a

      header = rows.shift
      return broadcast(:fail, :invalid_file) unless header[0] == 'email'

      users = []
      errors = []

      existing_users = User.with_campaign_user(@campaign.id).includes(:user_profile).
                       where(email: rows.pluck(0)).index_by(&:email)
      rows.each.with_index do |data, index|
        existing_user = existing_users[data[0]]
        if existing_user
          users << existing_user
        else
          errors << { index: index, email: data[0] }
        end
      end

      broadcast :ok, users, errors
    end

    def read_file
      Roo::CSV.new(@file.path, csv_options: { converters: [:numeric] })
    end
  end
end
