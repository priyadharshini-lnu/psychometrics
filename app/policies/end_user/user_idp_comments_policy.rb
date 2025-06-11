# frozen_string_literal: true

class EndUser::UserIdpCommentsPolicy < BasePolicy
  def index?
    @record == @current_user || @record.manager == @current_user
  end

  def create?
    @record == @current_user || @record.manager == @current_user
  end

  def show?
    @record == @current_user || @record.manager == @current_user
  end

  def update?
    @record.created_by == @current_user
  end

  def resolve?
    @record == @current_user || @record.manager == @current_user
  end

  def unresolve?
    @record == @current_user || @record.manager == @current_user
  end
end
