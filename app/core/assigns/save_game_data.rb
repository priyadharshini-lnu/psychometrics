# frozen_string_literal: true

module Assigns
  class SaveGameData < BaseCommand
    private_attr_accessor :assign, :form

    def initialize(assign, form)
      @assign = assign
      @form = form
    end

    def call
      results = assign.results || []
      results << form.attributes
      completed_groups = assign.meta_data['completed_groups'] || []
      completed_groups << form.group_id

      assign.update!(results: results, meta_data: assign.meta_data.merge('completed_groups' => completed_groups))

      broadcast :ok
    end
  end
end
