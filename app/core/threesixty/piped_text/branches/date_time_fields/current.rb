# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module DateTimeFields
        class Current < ::PipedText::BaseField
          def call
            broadcast :ok, Time.zone.now.strftime(params['f'])
          rescue StandardError
            broadcast :ok, ''
          end
        end
      end
    end
  end
end
