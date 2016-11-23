module Exports
  module Reports
    module Pdf
      class ReportExport
        def self.export(report, user, client = nil, opts = {})
          # TODO: Create task to periodical remove pdf files
          tmp_folder = Rails.root.join('tmp', 'reports')
          output = "#{tmp_folder}/report_#{report.id}_#{Time.now.to_f}.pdf"
          # Generate valid url for parse report to pdf
          url = if user.is?(:superadmin, :admin)
                  Rails.application.routes.url_helpers.preview_administration_report_url(report,
                                                                                         export: true,
                                                                                         user_token: user.authentication_token)
                else
                  Rails.application.routes.url_helpers.report_url(report,
                                                                  export: true,
                                                                  user_token: user.authentication_token,
                                                                  domain: Settings.domain,
                                                                  subdomain: client.subdomain)
                end

          args = {
            url: url,
            output: output,
            pageWidth: 850,
            pageHeight: 1100
          }.merge(opts).to_a.map { |key, value| "#{key}='#{value}'" }.join(' ')

          Dir.mkdir(tmp_folder) unless Dir.exist?(tmp_folder)

          system("phantomjs #{Rails.root.join('lib/raster.js')} #{args}")

          # output
          output
        end
      end
    end
  end
end
