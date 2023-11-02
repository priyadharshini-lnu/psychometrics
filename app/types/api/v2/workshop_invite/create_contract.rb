# frozen_string_literal: true

module Api
  module V2
    module WorkshopInvite
      class CreateContract < Api::Base::Contract
        config.messages.namespace = :workshop_invite_create

        schema Api::V2::WorkshopInvite::Schema.create_request

        rule(data: { attributes: :workshop_ids }) do
          if value.count.zero?
            key.failure(:filled?)
          end
        end

        rule(data: { attributes: :subjects }) do
          if value.count > ::WorkshopInvite::RESTRICTED_SUBJECTS
            key.failure(text:
              I18n.t('dry_errors.errors.exceeded_subjects_count',
                     count: ::WorkshopInvite::RESTRICTED_SUBJECTS))
          end
        end
      end
    end
  end
end
