# frozen_string_literal: true

namespace :one_time do
  desc 'Update norm to Global2023 for all Hogan reports where norm is Global'
  task update_hogan_norm_id: :environment do
    reports = Report.where.not(external_settings: nil).where(provider: 'hogan')

    reports.each do |report|
      external_settings = report.external_settings
      next unless external_settings['norm_id'] == 'Global' || external_settings['norm'] == 'Global'

      external_settings['norm_id'] = 'Global2023'
      external_settings.delete('norm')
      report.update(external_settings: external_settings)
      puts "Updated report #{report.id} with new norm_id Global2023"
    end

    puts 'Finished updating norms for Hogan reports.'
  end
end
