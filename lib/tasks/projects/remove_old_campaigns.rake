# frozen_string_literal: true

namespace :projects do
  task :remove_old_campaigns, [:project_id] => [:environment] do |_, args|
    ActiveRecord::Base.logger = Rails.logger = Logger.new(STDOUT)

    project = Client.projects.find(args[:project_id])
    Projects::RemoveOldCampaign.call!(project)
  end
end
