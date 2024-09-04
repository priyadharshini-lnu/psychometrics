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

      transformer = proc { |str| "<span style='direction: ltr; display: inline-block'>#{str}</span>" }
      text = Threesixty::PipedText::Perform.call!(
        object.props['text'], context[:piped_text_context], transformer
      )

      object.props.merge(
        text: text
      )
    end

    def builder?
      context[:builder]
    end
  end
end
