module Reports
  module Actions
    module Report
      extend Actions::Action

      action :update do |data, _current_administrator, report|
        report.update(data)
        nil
      end
    end
  end
end
