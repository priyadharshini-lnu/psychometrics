# frozen_string_literal: true

module Exports
  module Reports
    module Pdf
      class ReportExport
        attr_accessor :output

        def initialize(current_user, report, user, client, opts = {})
          @users_report = opts[:users_report]
          @current_user = current_user
          @report = report
          @user = user
          @client = client
          @opts = opts

          make_path
          build_url
          generate_report
        end

        def self.export(current_user, report, user, client, opts = {})
          file = new(current_user, report, user, client, opts)
          file.output
        end

        private

        attr_reader :current_user, :report, :user, :client, :opts, :url, :users_report

        def generate_report
          args = {
            url: url,
            output: output,
            pageWidth: report.props&.dig('sizes', 'width') || 850,
            pageHeight: report.props&.dig('sizes', 'height') || 1100,
            auth: Rails.application.secrets.http_auth
          }.merge(opts).to_a.map { |key, value| "#{key}='#{value}'" }.join(' ')

          Rails.logger.info "$(cd #{Rails.root} && npm run export_pdf -- #{args})"
          system("$(cd #{Rails.root} && npm run export_pdf -- #{args})")

          output
        end

        # Creates folder and file to the report
        #
        def make_path
          dir = opts.delete(:output_dir) || Rails.root.join('tmp', 'reports')
          dir = File.join(dir, user.email)
          filename = "#{user.email}_#{report.decorate.display_name.parameterize}_#{Time.now.to_i}.pdf"
          File.delete(filename) if File.exist?(filename)
          FileUtils.mkdir_p(dir)
          @output = File.join(dir, filename)
        end

        # Builds URL to report page
        #
        def build_url
          # Generate valid url for parse report to pdf
          params = {
            host: Settings.domain,
            user_token: current_user.authentication_token,
            export: true,
            lang: opts[:lang] || report.default_language || I18n.locale,
            port: Settings.port,
            protocol: Settings.protocol,
            users_report_id: users_report ? users_report.id : nil
          }

          @url =
            if current_user.is?(:superadmin, :client_admin, :project_admin)
              build_administration_url(params)
            else
              build_user_url(params)
            end
        end

        # Builds URL for Administration side
        #
        def build_administration_url(params = {})
          params = params.merge(
            domain: Settings.domain,
            subdomain: Settings.subdomain,
            client_id: client.id,
            user_id: user.id,
            id: report.id
          )

          Rails.application.
            routes.
            url_helpers.
            preview_administration_client_user_report_url(params)
        end

        # Builds URL for End User side
        #
        def build_user_url(params = {})
          params = params.merge(
            domain: Settings.domain,
            subdomain: client.subdomain
          )

          Rails.application.
            routes.
            url_helpers.
            export_report_url(report, params)
        end
      end
    end
  end
end
