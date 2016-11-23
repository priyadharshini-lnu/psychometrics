module Exports
  module Reports
    module Pdf
      class ReportExport
        def self.export(report, user, client, opts = {})
          # TODO: Create task to periodical remove pdf files
          tmp_folder = Rails.root.join('tmp', 'reports')
          output = "#{tmp_folder}/report_#{report.id}_#{Time.now.to_f}.pdf"
          # Generate valid url for parse report to pdf
          url = if user.is?(:superadmin, :admin)
                  Rails.application.routes.url_helpers.preview_administration_client_user_report_url(client_id: client.id,
                                                                                                     user_id: user.id,
                                                                                                     id: report.id,
                                                                                                     export: true,
                                                                                                     user_token: user.authentication_token,
                                                                                                     host: Settings.domain)
                else
                  Rails.application.routes.url_helpers.report_url(report,
                                                                  export: true,
                                                                  user_token: user.authentication_token,
                                                                  host: Settings.domain,
                                                                  subdomain: client.subdomain)
                end

          args = {
            url: url,
            output: output,
            pageWidth: 850,
            pageHeight: 1100
          }.merge(opts).to_a.map { |key, value| "#{key}='#{value}'" }.join(' ')

          Dir.mkdir(tmp_folder) unless Dir.exist?(tmp_folder)

          Rails.logger.info 'DEBUGGING'
          Rails.logger.info "phantomjs #{Rails.root.join('lib/raster.js')} #{args}"

          system("phantomjs #{Rails.root.join('lib/raster.js')} #{args}")

          # output
          output
        end
      end
    end
  end
end
