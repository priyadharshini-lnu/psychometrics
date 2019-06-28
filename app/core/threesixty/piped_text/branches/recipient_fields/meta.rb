# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module RecipientFields
        class Meta < BaseField
          def call
            row = DatasheetRow.joins(:datasheet).
              find_by(datasheets: { project_id: user.project_id }, email: user.email)

            return broadcast :ok, '' unless row

            broadcast :ok, row.data[path.second]
          end

          protected

          def user
            context[:recipient]
          end
        end
      end
    end
  end
end
