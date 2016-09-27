module Libraries
  module Actions
    module Library
      extend Actions::Action

      action :index do |data, _|
        folder = ::Library.find(data['parentId']) unless data['parentId'].to_i.zero?
        libraries = ::Library.with_parent(data['parentId']).search_query(data['searchQuery'])
        items = libraries.map do |library|
          LibrarySerializer.new(library).to_hash
        end
        breadcrumbs = (folder.try(:self_and_ancestors) || []).each do |f|
          LibrarySerializer.new(f).to_hash
        end

        {items: items, breadcrumbs: breadcrumbs}
      end
    end
  end
end
