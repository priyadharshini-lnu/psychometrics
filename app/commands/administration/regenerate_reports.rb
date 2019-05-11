module Administration
  class RegenerateReports < Rectify::Command
    def initialize(form, current_user, client)
      @form = form
      @current_user = current_user
      @client = client
    end

    def call
      return broadcast(:invalid) if form.invalid?

      ::Reports::BulkExportJob.perform_later(form.report_ids, current_user, client)

      broadcast(:ok)
    end

    private

    attr_reader :form, :current_user, :client
  end
end
