# frozen_string_literal: true

module Microsite
  module AnswerConverters
    class Form < Base
      # FROM (microsite raw answer):
      #   { 'kind' => 'form', 'values' => { 'gender' => 'male', 'ageRange' => '18-24', ... } }
      # TO (Lighthouse MetaInfo format):
      #   [{ 'index' => 0, 'value' => 'male' }, { 'index' => 1, 'value' => '18-24' }, ...]
      #
      # The index is determined by the field's position in the microsite question definition's fields array.
      def self.build_answers(result, _question, microsite_question)
        values = result['values']
        return nil if values.blank?

        fields = microsite_question&.dig('fields')
        return nil if fields.blank?

        fields.each_with_index.filter_map do |field, index|
          value = values[field['id']]
          next if value.nil?

          { 'index' => index, 'value' => value }
        end
      end
    end
  end
end
