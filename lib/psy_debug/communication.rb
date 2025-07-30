# frozen_string_literal: true

module PsyDebug
  class Communication < Base
    def campaign
      record.project_campaign
    end
  end
end
