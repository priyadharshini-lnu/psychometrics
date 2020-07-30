# frozen_string_literal: true

module Assigns
  class SaveAgileEvent < BaseCommand
    END_GROUP_EVENT = 'endGroup'
    ASSESSMENT_COMPLETE_EVENT = 'assessmentComplete'

    private_attr_accessor :assign, :form, :current_user

    def initialize(assign, form, current_user)
      @assign = assign
      @form = form
      @current_user = current_user
    end

    def call
      agile_event = assign.agile_events.create!(form.attributes)
      update_assign

      broadcast :ok, agile_event
    end

    private

    def update_assign
      case form.event
        when END_GROUP_EVENT
          end_group_event
        when ASSESSMENT_COMPLETE_EVENT
          complete_event
      end
    end

    def end_group_event
      completed_groups = assign.meta_data['completed_groups'] || []
      completed_groups << form.data[:id]
      assign.update!(meta_data: assign.meta_data.merge('completed_groups' => completed_groups.uniq))
    end

    def complete_event
      norm_data = { id: assign&.agile&.config&.dig('normId'), type: 'percentile' }
      # Validations and Callbacks are skipped
      assign.update_columns(status: :completed, completed_at: Time.now, norm_data: norm_data)

      ::Assigns::CalculateAgileScoring.call(assign) do
        on(:ok) { ::Assigns::GenerateReport.call(assign, current_user) }
      end
    end
  end
end
