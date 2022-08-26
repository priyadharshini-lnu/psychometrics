# frozen_string_literal: true

namespace :projects do
  task :remove, [:project_id] => [:environment] do |_, args|
    ActiveRecord::Base.logger = Rails.logger = Logger.new($stdout)

    project = Client.projects.find(args[:project_id])
    Projects::Remove.call!(project)
  end
end
