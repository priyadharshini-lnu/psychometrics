# frozen_string_literal: true

module Assessments
  module QuestionsImport
    class BlockForm < Base
      mimic :questions_import_block_form

      attribute :name, String

      validates :name, presence: true

      def default_values
        {
          'props' => {
            'randomization' => { 'type' => 'No' }, 'buttons' => { 'prev_button' => 'Previous', 'next_button' => 'Next' }
          }
        }
      end
    end
  end
end
