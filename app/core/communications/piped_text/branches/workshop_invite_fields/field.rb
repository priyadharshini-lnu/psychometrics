# frozen_string_literal: true

module Communications
  module PipedText
    module Branches
      module WorkshopInviteFields
        class Field < ::PipedText::BaseField
          def call
            Mobility.with_locale(params['locale'] || 'en') do
              method = possible_fields[path.last]
              broadcast :ok, workshop_invite.public_send(method)
            end
          end

          private

          def workshop_invite
            context[:workshop_invite]
          end

          def possible_fields
            {
              'Title' => :title,
              'Description' => :description
            }
          end
        end
      end
    end
  end
end
