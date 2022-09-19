# frozen_string_literal: true

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
