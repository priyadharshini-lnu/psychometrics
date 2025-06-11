# frozen_string_literal: true

module Api
  module V2
    module WorkshopSubject
      class CreateContract < Api::Base::Contract
        config.messages.namespace = :workshop_subject_create

        schema Api::V2::WorkshopSubject::Schema.create_request

        rule(data: { relationships: { user: { data: :id } } }) do
          workshop = ::Workshop.find_by(id: values.dig(:data, :relationships, :workshop, :data, :id))

          existing_workshop_subject = ::WorkshopSubject.joins(workshop: :campaign_assessment_group).
                                      participatable.
                                      where(workshops: {
                                        campaign_assessment_group_id: workshop.campaign_assessment_group_id
                                      }).
                                      find_by(campaign_id: _context[:campaign], user_id: value)

          if existing_workshop_subject
            key.failure(:part_of_other_workshop, workshop_name: existing_workshop_subject.workshop.name)
          end
        end

        rule(data: { relationships: { user: { data: :id } } }) do
          workshop = ::Workshop.find_by(id: values.dig(:data, :relationships, :workshop, :data, :id))

          subject_exists = ::WorkshopSubject.joins(workshop: :campaign_assessment_group).
                           where(workshops: { campaign_assessment_group_id: workshop.campaign_assessment_group_id }).
                           exists?(workshop_id: values.dig(:data, :relationships, :workshop, :data,
                                                           :id), user_id: value)
          key.failure(:already_exists) if subject_exists
        end
      end
    end
  end
end
