require './spec/features/helpers/clients'
require './spec/features/helpers/assessments'
require './spec/features/helpers/norms'
require './spec/features/helpers/reports'

module Features
  module Helpers
    include Clients
    include Assessments
    include Norms
    include Reports

    def reload_context
      DatabaseCleaner.clean
      before_context
    end

    def before_context
      # overwrite in feature
    end
  end
end
