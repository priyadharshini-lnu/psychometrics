module Exports
  module Reports
    module Pdf
      class ReportExport
        def self.export(current_user, report, user, client, protocol, opts = {})
          # TODO: Create task to periodical remove pdf files
          tmp_folder = Rails.root.join('tmp', 'reports')
          output = "#{tmp_folder}/#{user.decorate.display_name}_#{report.decorate.display_name}_#{Date.today.strftime('%F')}.pdf"
          # Generate valid url for parse report to pdf
          url_params = {
            host: Settings.domain,
            user_token: current_user.authentication_token,
            export: true,
            lang: opts[:lang] || I18n.locale
          }
          url = if current_user.is?(:superadmin, :admin)
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

          Dir.mkdir(tmp_folder) unless Dir.exist?(tmp_folder)

          Rails.logger.info("google-chrome --headless --disable-gpu --print-to-pdf='#{output}' '#{url}'")


          url = URI(url).tap { |uri| uri.userinfo = 'staging:sumatosoft' }.to_s

          system("#{Rails.application.secrets[:chrome_path]} --headless --disable-gpu --print-to-pdf='#{output}' '#{url}'")

          # output
          output
        end
      end
    end
  end
end
