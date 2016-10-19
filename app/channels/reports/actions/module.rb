module Reports
  module Actions
    module Module
      extend Actions::Action

      action :create do |data, _current_user, report|
        page = report.pages.find(data.delete('page_id'))
        mod = page.modules.create!(data)
        Reports::ModuleSerializer.new(mod).to_hash
      end

      action :update do |data|
        id = data.delete('id')
        ::Reports::Module.update(id, data)
        nil
      end

      action :destroy do |data|
        ::Reports::Module.destroy(data['id'])
        nil
      end

      action :rename do |data|
        ::Reports::Module.update(data['id'], data.slice('name'))
        nil
      end

      action :move_up do |data|
        mod = ::Reports::Module.find(data['id'])
        mod.move_higher
        Reports::ModuleSerializer.new(mod).to_hash
      end

      action :move_down do |data|
        mod = ::Reports::Module.find(data['id'])
        mod.move_lower
        Reports::ModuleSerializer.new(mod).to_hash
      end
    end
  end
end
