# frozen_string_literal: true

# == Schema Information
#
# Table name: reports_modules
#
#  id         :integer          not null, primary key
#  page_id    :integer
#  name       :string
#  props      :json
#  position   :integer
#  deleted_at :datetime
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  type       :string
#

module Reports
  class ModuleSerializer < ActiveModel::Serializer
    attributes :id, :name, :position, :props, :type, :assessment_id

    def props
      return object.props if !@instance_options[:piped_text_context] || object.props['sourceType'] != 'Text'

      object.props.merge(text: Threesixty::PipedText::Perform.call!(object.props['text'], @instance_options[:piped_text_context]))
    end
  end
end
