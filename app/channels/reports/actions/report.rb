module Reports
  module Actions
    module Report
      extend Actions::Action

      action :update do |data, _current_user, report|
        report.update(data)
        nil
      end

      action :change_filters do |data, _current_user, report|
        map_filters = report.filters.all.group_by(&:id)
        new_ids     = data['filters'].map { |f| f['id'] }
        old_ids     = map_filters.keys
        removed_ids = old_ids - new_ids
        # clear unused filters
        report.filters.where(id: removed_ids).delete_all
        data['filters'].each do |filter|
          if filter['id']
            db_filter = map_filters[filter['id']].first
            db_filter.update_attributes(conditions: filter['conditions'], name: filter['name'])
          else
            report.filters.create(conditions: filter['conditions'], name: filter['name'])
          end
        end
        # clear unused filter from all modules
        Reports::Module.joins(:page).where(reports_pages: {report_id: report.id}).where("reports_modules.props ->> 'filter' is not null").each do |r|
          if r.props['filter'] && r.props['filter'].is_a?(Array)
            r.props['filter'] = r.props['filter'] - removed_ids
            r.save
          end
        end
        report.filters.reload.map do |filter|
          ::Reports::FilterSerializer.new(filter).to_hash
        end
      end

      action :change_aliases do |data, _current_user, report|
        ActiveRecord::Base.transaction do
          data['aliases'].each do |factor_data|
            factors_alias = FactorsAlias.find_by(factor_id: factor_data['id'].to_i, report: report)
            factors_alias&.update(name: factor_data['alias'])
          end
        end
        nil
      end
    end
  end
end
