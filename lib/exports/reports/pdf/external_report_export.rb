# frozen_string_literal: true

module Exports
  module Reports
    module Pdf
      class ExternalReportExport
        class << self
          def export(assign, report, assigns_report, user, opts = {})
            external_report = external_report(assign, assigns_report)
            return false unless external_report

            output_dir = output_dir(user, opts)
            FileUtils.mkdir_p(output_dir)
            output_path = output_path(user, report, output_dir)
            copy_external_report(external_report, output_path)
          end

          private

          def output_dir(user, opts)
            output_dir = opts[:output_dir] || Rails.root.join('tmp', 'reports')
            File.join(output_dir, user.email)
          end

          def output_path(user, report, output_dir)
            filename = "#{user.email}_#{report.decorate.display_name.parameterize}_#{Date.today.strftime('%F')}.pdf"
            File.join(output_dir, filename)
          end

          def external_report(assign, assigns_report)
            mindmill_report = assign.mindmill_report.file
            hogan_report = assigns_report.external_report.file
            mindmill_report || hogan_report
          end

          def copy_external_report(external_report, output_path)
            if remote_file?(external_report.url)
              url = URI(external_report.url)
              url.scheme = 'http'
              IO.copy_stream(open(url.to_s), output_path) # rubocop:disable Security/Open
            else
              FileUtils.cp(external_report.url, output_path)
            end
          end

          def remote_file?(url)
            url.start_with?('//')
          end
        end
      end
    end
  end
end
