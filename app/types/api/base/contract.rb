# frozen_string_literal: true

module Api
  module Base
    class Contract < Dry::Validation::Contract
      config.messages.backend = :i18n
      config.messages.top_namespace = :dry_errors
    end
  end
end
