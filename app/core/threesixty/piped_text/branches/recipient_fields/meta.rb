# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module RecipientFields
        class Meta < BaseField
          def call
            data = campaign.datasheet_data(user.email)

            broadcast :ok, data[path.second]
          end

          protected

          def user
            context[:recipient]
          end

          def campaign
            context[:threesixty_campaign].campaign
          end
        end
      end
    end
  end
end
