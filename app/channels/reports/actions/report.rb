module Reports
  module Actions
    module Report
      extend Actions::Action

      action :update do |data, _current_administrator, report|
        report.update(data)
        nil
      end

      action :change_filters do |data, _current_administrator, report|
        report.update(data)
        filters = report.filters
        Reports::Module.joins(:page).where(reports_pages: {report_id: report.id}).where("reports_modules.props ->> 'filter' is not null").each do |r|
          unless filters.any? { |filter| filter['id'] == r.props['filter'] }
            r.props['filter'] = nil
            r.save
          end
        end
        nil
      end
    end
  end
end
