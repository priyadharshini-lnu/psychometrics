# frozen_string_literal: true

class Administration::DimensionPolicy < Administration::BasePolicy
  def index?
    @user.is?(:superadmin) || @user.has_grant?(:dimensions, :view)
  end

  def create?
    @user.is?(:superadmin) || @user.has_grant?(:dimensions, :manage)
  end

  def destroy?
    @user.is?(:superadmin) || @user.has_permission?(:dimensions, :manage, project_id: project_id)
  end

  def edit?
    @user.is?(:superadmin) || @user.has_permission?(:dimensions, :manage, project_id: project_id)
  end

  def update?
    @user.is?(:superadmin) || @user.has_grant?(:dimensions, :manage)
  end

  def copy?
    return false if record.is_a?(Dimension) && record.skill_rater?

    @user.is?(:superadmin) || @user.has_permission?(:dimensions, :manage, project_id: project_id)
  end

  def translations?
    @user.is?(:superadmin) || @user.has_permission?(:dimensions, :manage, project_id: project_id)
  end

  def export_translations?
    @user.is?(:superadmin) || @user.has_permission?(:dimensions, :manage, project_id: project_id)
  end

  def import_translations?
    @user.is?(:superadmin) || @user.has_permission?(:dimensions, :manage, project_id: project_id)
  end

  def import_factors?
    create?
  end

  def factors_modal?
    import_factors?
  end

  def actions?
    edit? & copy? & destroy?
  end

  def export_json?
    @user.is?(:superadmin)
  end

  def import?
    @user.is?(:superadmin)
  end

  def validate_import?
    @user.is?(:superadmin)
  end

  class Scope < Scope
    def resolve
      scope = super
      return scope if @user.is?(:superadmin)

      permitted_owner_ids = @user.client_admin_client_ids.uniq.select do |owner_id|
        @user.has_permission?(:dimensions, :view, project_id: owner_id)
      end
      scope.where(owner_id: permitted_owner_ids)
    end
  end
end
