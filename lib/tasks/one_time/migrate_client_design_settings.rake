# frozen_string_literal: true

namespace :one_time do
  task migrate_client_design_settings: :environment do
    Client.projects.where(design_migrated: false).find_each do |client|
      if client.design_setting.update(
        background_color: client.design['background_color'],
        login_box_position: client.design['login_box_position'] || 'auto',
        remote_background_url: client.background&.url,
        remote_logo_url: client.logo&.url,
        remote_secondary_logo_url: client.secondary_logo&.url
      )
        client.update(design_migrated: true)
      else
        puts "Client##{client.id} design migration failed"
        puts client.design_setting.errors.messages
      end
    end
  end
end
