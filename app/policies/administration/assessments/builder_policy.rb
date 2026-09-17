# frozen_string_literal: true

module Administration
  module Assessments
    class BuilderPolicy < Administration::BasePolicy
      def show?
        @user.is?(:superadmin) || @user.has_grant?(:assessments, :manage)
      end

      def norms?
        show?
      end

      def block_templates?
        show?
      end

      def question_templates?
        show?
      end

      def block_template?
        show?
      end

      def question_template?
        show?
      end

      def geo?
        show?
      end

      def update?
        @user.is?(:superadmin) || @user.has_grant?(:assessments, :manage)
      end

      def upload_campaign_factors?
        @user.is?(:superadmin) || @user.has_grant?(:assessments, :manage)
      end
    end
  end
end
