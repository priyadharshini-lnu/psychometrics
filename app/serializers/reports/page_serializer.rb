# frozen_string_literal: true

# == Schema Information
#
# Table name: reports_pages
#
#  id         :integer          not null, primary key
#  report_id  :integer
#  name       :string
#  props      :json
#  position   :integer
#  deleted_at :datetime
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

module Reports
  class PageSerializer < ActiveModel::Serializer
    attributes :id, :name, :position, :props, :display_logic, :modules

    def modules
      object.modules.order(:id).map do |mod|
        ModuleSerializer.new(mod, piped_text_context: @instance_options[:piped_text_context],
                                  builder: @instance_options[:builder])
      end
    end
  end
end
