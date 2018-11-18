module Exports
  module Reports
    module Pdf
      class ReportExport
        def self.export(current_user, report, user, client, protocol, opts = {})
          output_dir = opts.delete(:output_dir) || Rails.root.join('tmp', 'reports')
          output_dir = File.join(output_dir, user.email)
          FileUtils.mkdir_p(output_dir)
          filename = "#{user.email}_#{report.decorate.display_name}_#{Date.today.strftime('%F')}.pdf"
          output = File.join(output_dir, filename)
          # Generate valid url for parse report to pdf
          url_params = {
            host: Settings.domain,
            user_token: current_user.authentication_token,
            export: true,
            lang: opts[:lang] || I18n.locale
          }
          url = if current_user.is?(:superadmin, :client_admin, :project_admin)
                  Rails.application.routes.url_helpers.
                    preview_administration_client_user_report_url(url_params.merge({
                                                                                     client_id: client.id,
                                                                                     user_id: user.id,
                                                                                     id: report.id,
                                                                                     port: Settings.port,
                                                                                     protocol: protocol
                                                                                    }))
                else
                  Rails.application.routes.url_helpers.
                    report_url(report, url_params.merge({
                                                          domain: Settings.domain,
                                                          subdomain: client.subdomain,
                                                          port: Settings.port,
                                                          protocol: protocol
                                                         }))
                end

          args = {
            url: url,
            output: output,
            pageWidth: 850,
            pageHeight: 1100,
            auth: Rails.application.secrets.http_auth
          }.merge(opts).to_a.map { |key, value| "#{key}='#{value}'" }.join(' ')

          Rails.logger.info "phantomjs #{Rails.root.join('lib/raster.js')} #{args}"
          system("phantomjs #{Rails.root.join('lib/raster.js')} #{args}")

          output
        end
      end
    end
  end
end
