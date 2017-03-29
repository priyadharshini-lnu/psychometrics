class AssignPolicy < BasePolicy
  def index?
    return false if @current_user.is_anonym?
    true
  end

  def update?
    @record.membership_id == @current_membership.id
  end

  class Scope < Scope
    def resolve
      @user[:current_membership].
          assigns.
          joins('LEFT JOIN assessments a on a.id = assigns.assessment_id and a.disabled = false').
          where('a.id is not null or p.id is not null')
    end
  end
end
