# frozen_string_literal: true

# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Add additional assets to the asset load path
# Rails.application.config.assets.paths << Emoji.images_path

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in app/assets folder are already added.
Rails.application.config.assets.precompile += %w[administration.scss administration.js jquery2.js]
Rails.application.config.assets.precompile += %w[threesixty_dependencies.scss application_new.scss iframe.scss]
Rails.application.config.assets.precompile += %w[application_new.js threesixty.js]
Rails.application.config.assets.precompile << 'filterrific/filterrific-spinner.gif'
Rails.application.config.assets.precompile << 'administration/*.mp3'
# Rails.application.config.assets.precompile += %w[psychometrics_vendor.js psychometrics_app.js psychometrics_preview.js
#                                                  psychometrics_qcenter.js psychometrics_bcenter.js]
# Rails.application.config.assets.precompile += %w[psychometrics_app.scss psychometrics_qcenter.scss
#                                                  psychometrics_bcenter.scss]
# Rails.application.config.assets.precompile += %w[psychometrics_vendor.css psychometrics_pass_assessment.css
#                                                  psychometrics_pass_assessment.js]
# Rails.application.config.assets.precompile += %w[psychometrics_reports_vendor.js psychometrics_reports_preview.js
#                                                  psychometrics_reports_app.js]
# Rails.application.config.assets.precompile += %w[psychometrics_reports_vendor.css psychometrics_reports_preview.css
#                                                  psychometrics_reports_app.scss]
