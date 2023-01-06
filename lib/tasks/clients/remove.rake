# frozen_string_literal: true

namespace :clients do
  task :remove, [:client_id] => [:environment] do |_, args|
    ActiveRecord::Base.logger = Rails.logger = Logger.new($stdout)

    client = Client.find(args[:client_id])
    Clients::Remove.call!(client)
  end
end
