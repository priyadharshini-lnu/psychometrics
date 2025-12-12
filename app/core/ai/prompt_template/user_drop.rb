# frozen_string_literal: true

module AI
  module PromptTemplate
    class UserDrop < Liquid::Drop
      def initialize(user)
        @user = user
      end

      def full_name
        "#{@user.first_name} #{@user.last_name}"
      end

      delegate :first_name, to: :@user

      delegate :last_name, to: :@user

      delegate :age, to: :@user

      delegate :gender, to: :@user

      def locale
        @user.locale || I18n.default_locale.to_s
      end

      delegate :email, to: :@user

      def language
        I18n.t("languages.#{@user.locale || I18n.default_locale}")
      end
    end
  end
end
