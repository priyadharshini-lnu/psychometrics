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

  def generate_report
    Assigns::GenerateReport.call(assign, current_user)
  end
end
