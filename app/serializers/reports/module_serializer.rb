# frozen_string_literal: true

module Reports
  class ModuleSerializer < ActiveModel::Serializer
    attributes :id, :name, :position, :props, :type, :assessment_id
    attribute :meta, if: :builder?

    def props
      return object.props if !@instance_options[:piped_text_context] || object.props['sourceType'] != 'Text'

      transformer = proc { |str| "<span style='direction: ltr; display: inline-block'>#{str}</span>" }
      text = Threesixty::PipedText::Perform.call!(
        object.props['text'], @instance_options[:piped_text_context], transformer
      )

      object.props.merge(
        text: text
      )
    end

    def builder?
      @instance_options[:builder]
    end
  end
end
