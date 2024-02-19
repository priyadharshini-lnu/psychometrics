# frozen_string_literal: true

module Reports
  class PageSerializer < Panko::Serializer
    attributes :id, :name, :position, :props, :display_logic, :modules

    def modules
      Panko::ArraySerializer.new(
        object.modules.order(:id),
        each_serializer: ModuleSerializer,
        context: {
          piped_text_context: context[:piped_text_context],
          builder: context[:builder]
        }
      ).to_a
    end
  end
end
