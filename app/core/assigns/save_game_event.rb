# frozen_string_literal: true

module Assigns
  class SaveGameEvent < BaseCommand
    END_GROUP_EVENT = 'endGroup'
    ASSESSMENT_COMPLETE_EVENT = 'assessmentComplete'

    private_attr_accessor :assign, :form

    def initialize(assign, form)
      @assign = assign
      @form = form
    end

    def call
      game_event = assign.game_events.create!(form.attributes)
      update_assign

      broadcast :ok, game_event
    end

    private

    def update_assign
      if form.event == END_GROUP_EVENT
        completed_groups = assign.meta_data['completed_groups'] || []
        completed_groups << form.data['id']
        assign.update!(meta_data: assign.meta_data.merge('completed_groups' => completed_groups.uniq))
      end

      assign.update(status: :completed, completed_at: Time.now) if form.event == ASSESSMENT_COMPLETE_EVENT
    end
  end
end
