# frozen_string_literal: true

module Reports
  class ModuleSerializer < Panko::Serializer
    attributes :id, :name, :position, :props, :type, :assessment_id, :meta

    def meta
      return {} unless builder?

      object.meta
    end

    def props
      return object.props if !context[:piped_text_context] || object.props['sourceType'] != 'Text'

      transformer = proc { |str| "<span style=\"direction: ltr; display: inline-block;\">#{str}</span>" }
      piped_text_context = context[:piped_text_context].merge(
        users_result: users_result,
        report_results: context[:user_results_hash]&.values
      )
      text = Threesixty::PipedText::Perform.call!(object.props['text'], piped_text_context, transformer)

      object.props.merge(
        text: text
      )
    end

    def builder?
      context[:builder]
    end

    private

    def users_result
      return nil unless context[:user_results_hash] && context[:piped_text_context][:subject]

      subject_id = context[:piped_text_context][:subject].id
      assessment_id = object.assessment_id

      context[:user_results_hash][[assessment_id, subject_id]]
    end
  end
end
