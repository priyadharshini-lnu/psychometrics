# frozen_string_literal: true

class UpdateAssign < Rectify::Command
  def initialize(form, assign, current_user)
    @form = form
    @assign = assign
    @current_user = current_user
  end

  def call
    return broadcast(:invalid) if form.invalid?

    update_assign
    generate_report if assign.completed?

    broadcast(:ok)
  end

  private

  attr_reader :form, :assign, :current_user

  # Sets new data to the assign
  #   and increases the step of assign
  #
  def update_assign
    assign.update!(form.attributes)

    # Calculates scoring and sets time of completion
    if assign.completed?
      assign.calculate_scoring
      assign.occupations = Assigns::CalculateOccupations.call!(assign)
      assign.innovation_styles = Assigns::CalculateInnovationStyles.call!(assign)
      assign.completed_at = Time.now
    end

    assign.save!
  end

  # Sends to generate PDF report
  #
  def generate_report
    # Gets a list of enabled assigns reports
    enabled_assigns_reports = assign.original_or_self.enabled_assigns_reports

    # Sets status to generating and sends to generate report
    AssignsReport.where(id: enabled_assigns_reports.map(&:id)).update_all(generating: true)
    enabled_assigns_reports.each do |assigns_report|
      ::Reports::ExportJob.perform_later(assigns_report, current_user)
    end
  end
end
