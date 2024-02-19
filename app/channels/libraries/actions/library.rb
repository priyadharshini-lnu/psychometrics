# frozen_string_literal: true

module Libraries
  module Actions
    module Library
      extend Actions::Action

      action :index do |data, current_user|
        ActionCable.server.config.logger = Rails.logger

        libraries = ::Administration::LibraryPolicy::Scope.new(current_user, ::Library).resolve
        folder = libraries.find(data['with_parent']) unless data['with_parent'].to_i.zero?

        # Filter library
        libraries = libraries.
                    with_parent(data['with_parent']).
                    search_query(data['search_query']).
                    with_type(data['with_type']).
                    order(type: :asc, created_at: :desc)
        items = Panko::ArraySerializer.new(
          libraries,
          each_serializer: LibrarySerializer
        ).to_a

        # Build breadcrumb
        breadcrumbs = (folder.try(:path) || []).each do |f|
          LibrarySerializer.new.serialize(f)
        end

        { items: items, breadcrumbs: breadcrumbs }
      end
    end
  end
end
