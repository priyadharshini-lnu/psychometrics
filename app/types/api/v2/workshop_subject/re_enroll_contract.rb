# frozen_string_literal: true

module Api
  module V2
    module WorkshopSubject
      class ReEnrollContract < Api::Base::Contract
        config.messages.namespace = :workshop_subject_re_enroll

        schema do
          required(:data).hash do
            required(:attributes).hash do
              required(:subject_id).filled(:string)
            end
          end
        end

        rule(:data) do
          workshop_subject = ::WorkshopSubject.find(_context[:params][:id])
          workshop = workshop_subject.workshop

          if workshop.scheduling_lead_time_passed? && !workshop_subject.late_cancelled?
            key.failure(:scheduling_lead_time_passed)
          end

          unless workshop.seats_available?
            key.failure(:no_seats_available)
          end
        rescue ActiveRecord::RecordNotFound
          key.failure(:workshop_subject_not_found)
        end
      end
    end
  end
end
