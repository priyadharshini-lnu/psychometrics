# frozen_string_literal: true

module UserReports
  class GenerateAndSavePdf < BaseCommand
    private_attr_reader :current_user, :job_record, :campaign, :report, :user, :user_reports, :options

    def initialize(user_reports, current_user, options = {}, job_record = nil)
      @user_reports = Array.wrap(user_reports)
      @current_user = current_user
      @job_record = job_record
      @options = options
    end

    def call # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
      job_record&.update(total_tasks: user_reports.length)
      user_reports.each do |user_report|
        report = user_report.report

        unless report.provider_internal? || user_report.generatable?
          job_record&.increment_completed_tasks!
          next
        end

        user_report.update!(status: :generating) unless report.hogan?

        generate_hogan_report(user_report) if report.hogan?
        generate_saville_report(user_report) if report.provider_saville?
        generate_pearson_report(user_report) if report.provider_pearson?
        generate_internal_report(user_report) if report.provider_internal?
        job_record&.increment_completed_tasks! unless async_report_generation?(report)
      end

      broadcast :ok
    end

    def generate_internal_report(user_report)
      locales = options.dig(:selected_reports, user_report.report_id.to_s) || options[:locales]
      return generate_and_attach_internal_report_pdf(user_report) if locales.blank?

      locales.each do |locale|
        generate_pdf_for_language(user_report, locale, options[:force_regenerate])
      end
    end

    def generate_pdf_for_language(user_report, locale, force_regenerate)
      if !force_regenerate && user_report.user_report_pdf(locale: locale)&.pdf_file&.attached?
        job_record&.increment_completed_tasks!
      else
        generate_and_attach_internal_report_pdf(user_report, locale)
      end
    end

    def generate_and_attach_internal_report_pdf(user_report, locale = nil)
      options[:lang] = locale if locale

      data = UserReports::GeneratePdf.call!(
        user_report,
        current_user,
        options.reverse_merge(
          lang: user_report.effective_default_language
        ).merge(admin_job_record_id: job_record&.id)
      )

      return unless data[:file_path]

      File.open(data[:file_path]) do |file|
        user_report.attach_pdf!(file, locale: locale)
      end
    end

    def generate_hogan_report(user_report)
      Hogan::SaveReportsAndScoresJob.perform_later(user_report)
    end

    def generate_saville_report(user_report)
      user_report.user_results.includes(:user_assessment).find_each do |ur|
        Saville::AssessmentOrderRequest.call!(ur.user_assessment)
      end
    end

    def generate_pearson_report(user_report)
      user_report.user_results.includes(:user_assessment).find_each do |ur|
        Pearson::SaveScoresAndReports.call!(ur.user_assessment)
      end
    end

    def async_report_generation?(report)
      Settings.features.url_to_pdf_faas && report.provider_internal?
    end
  end
end
