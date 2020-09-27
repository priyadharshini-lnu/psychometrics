# frozen_string_literal: true

module UsersResults
  class SaveAgileEvent < BaseCommand
    END_GROUP_EVENT = 'endGroup'
    ASSESSMENT_COMPLETE_EVENT = 'assessmentComplete'

    private_attr_accessor :user_result, :form, :current_user

    def initialize(user_result, form, current_user)
      @user_result = user_result
      @form = form
      @current_user = current_user
    end

    def call
      agile_event = user_result.agile_events.create!(form.attributes)
      update_user_result

      broadcast :ok, agile_event
    end

    private

    def update_user_result
      case form.event
        when END_GROUP_EVENT
          end_group_event
        when ASSESSMENT_COMPLETE_EVENT
          complete_event
      end
    end

    def end_group_event
      completed_groups = user_result.meta_data['completed_groups'] || []
      completed_groups << form.data[:id]
      user_result.update!(meta_data: user_result.meta_data.merge('completed_groups' => completed_groups.uniq))
    end

    def complete_event
      # Validations and Callbacks are skipped
      user_result.update_columns(norm_attributes.merge(status: :completed, completed_at: Time.now))

      ::UsersResults::CalculateAgileScoring.call!(user_result, current_user)
    end

    def norm_attributes
      norm_id = user_result&.agile&.config&.dig('normId')
      norm_type = 'percentile'

      return { norm_type: { id: norm_id, type: norm_type } } if user_result.is_a?(Assign)

      { norm_id: norm_id, norm_type: norm_type }
    end
  end
end
