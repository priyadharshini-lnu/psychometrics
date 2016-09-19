module Reports
  module Actions
    module Page
      extend Actions::Action

      action :create do |data, _current_administrator, report|
        page = report.pages.create!(data)
        Reports::PageSerializer.new(page).to_hash
      end

      action :update do |data|
        id = data.delete('id')
        ::Reports::Page.update(id, data)
        nil
      end

      action :destroy do |data|
        page = ::Reports::Page.find(data['id'])
        page.update(deleted_at: Time.now)
        page.modules.update_all(deleted_at: Time.now)
        nil
      end

      action :rename do |data|
        page = ::Reports::Page.find(data['id'])
        page.update(name: data['name'])
        nil
      end

      action :move_up do |data|
        page = ::Reports::Page.find(data['id'])
        page.move_higher
        Reports::PageSerializer.new(block).to_hash
      end

      action :move_down do |data|
        page = ::Reports::Page.find(data['id'])
        page.move_lower
        Reports::PageSerializer.new(block).to_hash
      end

      action :restore do |data|
        page = ::Reports::Page.find(data['id'])
        page.update(deleted_at: nil)
        Reports::PageSerializer.new(block).to_hash
      end

      action :permanent_destroy do |data|
        ::Reports::Page.destroy(data['id'])
        nil
      end

      action :clone do |data|
        page = ::Reports::Page.find(data['id'])
        cloned_page = page.amoeba_dup
        cloned_page.save
        Reports::PageSerializer.new(cloned_page).to_hash
      end
    end
  end
end
