class UpdateAssign < Rectify::Command
  def initialize(form, assign, current_user)
    @form = form
    @assign = assign
    @current_user = current_user
  end

  def call
    return broadcast(:invalid) if form.invalid?

    transaction do
      update_assign
      generate_report if assign.completed?
    end

    broadcast(:ok)
  end

  private

  attr_reader :form, :assign, :current_user

  # Sets new data to the assign
  #   and increases the step of assign
  #
  def update_assign
    assign.assign_attributes(form.attributes)
    assign.step = assign.step.to_i + 1

    # Calculates scoring and sets time of completion
    if assign.completed?
      assign.calculate_scoring
      assign.completed_at = Time.now
    end

    assign.save!
  end

  # Sends to generate PDF report
  #
  def generate_report
    assign.original_or_self.assigns_reports.update_all(generating: true)
    assign.original_or_self.assigns_reports.each do |assigns_report|
      ::Reports::ExportJob.perform_later(assigns_report, current_user)
    end
  end
end
