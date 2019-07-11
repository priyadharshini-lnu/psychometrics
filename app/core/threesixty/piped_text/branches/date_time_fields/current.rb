# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module DateTimeFields
        class Current < BaseField

          def call
            return broadcast :ok, Time.now.strftime(params['f'])
          rescue Exception => e
            broadcast :ok, ''
          end

        end
      end
    end
  end
end
