module Libraries
  module Actions
    module Library
      extend Actions::Action

      action :index do |data, _|
        folder = ::Library.find(data['with_parent']) unless data['with_parent'].to_i.zero?

        # Filter library
        libraries = ::Library.
                    with_parent(data['with_parent']).
                    search_query(data['search_query']).
                    with_type(data['with_type']).
                    order({ type: :asc, created_at: :desc })
        items = libraries.map do |library|
          LibrarySerializer.new(library).to_hash
        end

        # Build breadcrumb
        breadcrumbs = (folder.try(:self_and_ancestors) || []).each do |f|
          LibrarySerializer.new(f).to_hash
        end

        { items: items, breadcrumbs: breadcrumbs }
      end
    end
  end
end
