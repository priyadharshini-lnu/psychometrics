module Exports
  module Reports
    module Pdf
      class ExternalReportExport
        class << self
          def export(report, user, external_report_path, opts = {})
            output_dir = output_dir(user, opts)
            FileUtils.mkdir_p(output_dir)
            output_path = output_path(user, report, output_dir)
            FileUtils.cp(external_report_path, output_path, verbose: true)
          end

          private

          def output_dir(user, opts)
            output_dir = opts[:output_dir] || Rails.root.join('tmp', 'reports')
            output_dir = File.join(output_dir, user.email)
          end

          def output_path(user, report, output_dir)
            filename = "#{user.email}_#{report.decorate.display_name}_#{Date.today.strftime('%F')}.pdf"
            output_path = File.join(output_dir, filename)
          end
        end
      end
    end
  end
end
