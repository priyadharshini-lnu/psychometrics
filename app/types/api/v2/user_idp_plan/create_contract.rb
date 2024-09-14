# frozen_string_literal: true

module Api
  module V2
    module UserIdpPlan
      class CreateContract < Api::Base::Contract
        config.messages.namespace = :user_idp_plan

        schema Api::V2::UserIdpPlan::Schema.create_request

        rule(data: { attributes: :user_id }) do
          existing_record = ::UserIdpPlan.exists?(user_id: value,
                                                  campaign_id: values.dig(:data, :attributes, :campaign_id),
                                                  idp_template_id: values.dig(:data, :attributes, :idp_template_id),
                                                  active: true)

          key.failure(:idp_template_already_assigned_to_user) if existing_record
        end
      end
    end
  end
end
