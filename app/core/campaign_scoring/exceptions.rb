# frozen_string_literal: true

module CampaignScoring
  module Exceptions
    class Base < StandardError
    end

    class WrongOutputType < Base
    end

    class IncorrectFunctionUsages < Base
    end
  end
end
