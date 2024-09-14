# frozen_string_literal: true

class EndUser::SkillGapReportPolicy < ::BasePolicy
  def show?
    @record == @current_user || @record.manager == @current_user
  end
end
