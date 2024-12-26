# frozen_string_literal: true

module Api
  module V1
    module Campaigns
      class ValidateForm < Rectify::Form
        attribute :existing_record, String
        attribute :id, Integer
        attribute :active, Boolean
        attribute :external_id, String, default: nil

        validates :existing_record, inclusion: { in: %w[add_with_existing_response add_and_allow_new_response] }
        validates :id, presence: true
        validates_inclusion_of :active, in: [true, false]

        validate :validate_external_id

        def validate_external_id
          return if external_id.nil?

          query = ::CampaignUser.where(campaign_id: id, external_id: external_id)
          query = query.where.not(user_id: context.user.id) if context&.user

          if query.exists?
            errors.add(
              :external_id,
              I18n.t(
                'administration.api.campaigns.validate_form.external_id_taken',
                external_id: external_id
              )
            )
          end
        end
      end
    end
  end
end
