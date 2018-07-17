RAILS_ENV=production bundle exec rake aliases:remove_value_and_label_from_props &&

RAILS_ENV=production bundle exec rake aliases:change_fieldname_in_reports_module_props &&

RAILS_ENV=production bundle exec rake aliases:create_factors_aliases &&

RAILS_ENV=production bundle exec rake aliases:remove_name_from_scorings
