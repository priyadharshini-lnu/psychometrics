I18n.translations || (I18n.translations = {});
I18n.translations["en"] = I18n.extend((I18n.translations["en"] || {}), {
  "reports": {
    "modules": {
      "common": {
        "almost_always": "Almost Always",
        "less_typical": "Less Typical",
        "moderate": "Moderate",
        "more_typical": "More Typical",
        "rare": "Rare"
      },
      "cpi_occupations": {
        "occupations": "Occupations",
        "your_potential_suitability": "Your Potential Suitability"
      },
      "gap_assessment": {
        "gap": "Gap",
        "item": "Item",
        "negative_gap": "Negative Gaps",
        "no_negative_gaps": "There are no Negative Gaps",
        "no_positive_gaps": "There are no Positive Gaps",
        "positive_gap": "Positive Gaps",
        "rank": "Rank",
        "scoring_category": "Scoring Category"
      },
      "highest_lowest": {
        "average": "Average",
        "bottom_5": "BOTTOM 5",
        "category": "Category",
        "email": "Email",
        "first_name": "First Name",
        "highest_scores": "Highest Scores",
        "item": "Item",
        "last_name": "Last Name",
        "lowest_scores": "Lowest scores",
        "mean_score": "Mean Score",
        "rank": "Rank",
        "result": "Result",
        "score": "Score",
        "scoring_category": "Scoring Category",
        "sub_competenties": "Sub-Competencies",
        "top_5": "TOP 5"
      },
      "potential_career_full": {
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "career_strengths_and_results": "Career Strengths and Your Results",
        "career_sub_tracks": "Career Sub-tracks",
        "detailed_career_guide": "Detailed Career Guide",
        "diploma_qualification": "Diploma Qualification",
        "education_level": "Education Level",
        "high_school_entry_roles": "High School Entry Roles",
        "key_career_tracks_within": "Below is a list of potential job roles for each of the career tracks. Remember this list is indicative only, and not exhaustive. Do note that roles in italics require higher levels of education and / or experience.",
        "potential_areas_of_study": "Potential Areas of Study",
        "potential_roles": "Potential Roles",
        "strength_high": "Signature Strength",
        "strength_low": "Developmental Strength",
        "strength_moderate": "Potential Strength",
        "work_environment": "Work Environment",
        "your_suitability": "Your Suitability"
      },
      "potential_career_short": {
        "career": "career",
        "for_this": "for this",
        "key": "key",
        "strengths": "strengths",
        "your_scores": "Your Scores"
      },
      "single_value": {
        "factor_name": "Scoring Category",
        "question_name": "Questions"
      },
      "single_value_cluster": {
        "competency": "Competency",
        "description": "Description",
        "developmental_rating": "Developmental Rating",
        "questions": "Questions"
      },
      "strength_clusters": {
        "index_sub_factors_considered": "Thriving Index sub-factors that have been considered to provide your final score for the %{workstyle} work environment",
        "possible_roles": "Possible Roles",
        "work_environments": "Expected Work Environments"
      },
      "three_sixty_default": {
        "factor": {
          "items": "Items",
          "max": "Max Value",
          "mean": "Mean",
          "min": "Min Value",
          "standardDeviation": "Standard Deviation",
          "sum": "Sum",
          "totalResponses": "Total Responses",
          "variance": "Variance",
          "weightedMean": "Weighted Mean"
        },
        "statistic": "Statistic",
        "value": "Value"
      },
      "three_sixty_report_summary": {
        "number_by_filter_evaluations_received": "Number of %{filter} evaluations received",
        "number_of_evaluators_invited": "Number of evaluators invited",
        "number_of_evaluators_received": "Number of evaluations received",
        "number_of_evaluators_responded": "Number of evaluators responded",
        "subject": "Subject",
        "total_evaluations": "Total evaluations for this assessment"
      }
    },
    "show": {
      "export_pdf": "Export to PDF",
      "header": "Report"
    },
    "statuses": {
      "approved": "Approved",
      "available": "Available",
      "denied": "Denied",
      "incomplete": "Incomplete",
      "not_available": "Not available",
      "on_hold": "On hold"
    }
  },
  "subjects": {
    "statuses": {
      "completed": "Completed",
      "done": "Done",
      "not_completed": "Not Completed"
    }
  },
  "threesixty": {
    "add": "Add",
    "and": "And",
    "approve_all": "Approve All",
    "approve_evaluations": "Approve Evaluations",
    "approve_nominations": "Approve Nominations",
    "approve_reports": "Approve Reports",
    "approved": "Approved",
    "as_my": "as my",
    "back_to_tasks": "Back to tasks",
    "cancel": "Cancel",
    "decline": "Decline",
    "decline_invite": "Decline Invite",
    "denied": "Denied",
    "deny_all": "Deny All",
    "email_approve_request": "Email Approval Request",
    "evaluation": "Evaluation",
    "evaluations": "Evaluations",
    "help": "Help",
    "language": "Language",
    "my_projects": "My Projects",
    "nominate": "Nominate",
    "nominate_evaluators": "Nominate Evaluators to",
    "nomination": "Nomination",
    "nominations": "Nominations",
    "or": "Or",
    "page_title": "Signify 360° Review - Apply Level",
    "remind_all": "Remind All",
    "reports": "Reports",
    "select_relationnship": "Select Relationship",
    "select_relationship": "Select Relationship",
    "setup_nominations": "Set up nominations",
    "total_progress": "Total progress",
    "user_name_input_placeholder": "type name or email...",
    "waiting": "Waiting"
  },
  "validations": {
    "character_range": "Your response must be at least %{min} and no more than %{max} characters.",
    "date": "Your response must be a valid date (dd/mm/yyyy)",
    "each_group_contains": "Each group needs to contain not less than %{min} and not more than %{max} items",
    "email": "Your response must be a valid email",
    "issue": "Issue",
    "least": "Please answer at least %{min} choice(s).",
    "least_hotspot": "Please answer at least %{min} choice(s).",
    "max_length": "Your response must be no more than %{max} characters.",
    "min_length": "Your response must be at least %{min} characters.",
    "must_rank_between": "Please assign a value from %{min} to %{max} for each item. Values may not be repeated.",
    "must_select": "Please select from %{min} to %{max} choices",
    "number": "Your response must be a number",
    "please_answer_question": "Please answer this question",
    "please_record_and_save_video_first": "Please record and save the video before you continue",
    "range": "Please answer at least %{min} and no more than %{max} choice(s).",
    "text": "Your response must not contain a numbers",
    "title": "Sorry, you cannot continue until you correct the following:"
  }
});
I18n.translations["ar"] = I18n.extend((I18n.translations["ar"] || {}), {
  "reports": {
    "modules": {
      "common": {
        "almost_always": "Almost Always",
        "less_typical": "Less Typical",
        "moderate": "Moderate",
        "more_typical": "More Typical",
        "rare": "Rare"
      },
      "cpi_occupations": {
        "occupations": "Occupations",
        "your_potential_suitability": "Your Potential Suitability"
      },
      "gap_assessment": {
        "gap": "Gap",
        "item": "Item",
        "negative_gap": "Negative Gaps",
        "no_negative_gaps": "There are no Negative Gaps",
        "no_positive_gaps": "There are no Positive Gaps",
        "positive_gap": "Positive Gaps",
        "rank": "Rank",
        "scoring_category": "Scoring Category"
      },
      "highest_lowest": {
        "average": "Average",
        "bottom_5": "BOTTOM 5",
        "category": "Category",
        "email": "Email",
        "first_name": "First Name",
        "highest_scores": "Highest Scores",
        "item": "Item",
        "last_name": "Last Name",
        "lowest_scores": "Lowest scores",
        "mean_score": "Mean Score",
        "rank": "Rank",
        "result": "Result",
        "score": "Score",
        "scoring_category": "Scoring Category",
        "sub_competenties": "Sub-Competencies",
        "top_5": "TOP 5"
      },
      "potential_career_full": {
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "career_strengths_and_results": "Career Strengths and Your Results",
        "career_sub_tracks": "Career Sub-tracks",
        "detailed_career_guide": "Detailed Career Guide",
        "diploma_qualification": "Diploma Qualification",
        "education_level": "Education Level",
        "high_school_entry_roles": "High School Entry Roles",
        "key_career_tracks_within": "Below is a list of potential job roles for each of the career tracks. Remember this list is indicative only, and not exhaustive. Do note that roles in italics require higher levels of education and / or experience.",
        "potential_areas_of_study": "Potential Areas of Study",
        "potential_roles": "Potential Roles",
        "strength_high": "Signature Strength",
        "strength_low": "Developmental Strength",
        "strength_moderate": "Potential Strength",
        "work_environment": "Work Environment",
        "your_suitability": "Your Suitability"
      },
      "potential_career_short": {
        "career": "career",
        "for_this": "for this",
        "key": "key",
        "strengths": "strengths",
        "your_scores": "Your Scores"
      },
      "single_value": {
        "factor_name": "Scoring Category",
        "question_name": "Questions"
      },
      "single_value_cluster": {
        "competency": "Competency",
        "description": "Description",
        "developmental_rating": "Developmental Rating",
        "questions": "Questions"
      },
      "strength_clusters": {
        "index_sub_factors_considered": "Thriving Index sub-factors that have been considered to provide your final score for the %{workstyle} work environment",
        "possible_roles": "Possible Roles",
        "work_environments": "Expected Work Environments"
      },
      "three_sixty_default": {
        "factor": {
          "items": "Items",
          "max": "Max Value",
          "mean": "Mean",
          "min": "Min Value",
          "standardDeviation": "Standard Deviation",
          "sum": "Sum",
          "totalResponses": "Total Responses",
          "variance": "Variance",
          "weightedMean": "Weighted Mean"
        },
        "statistic": "Statistic",
        "value": "Value"
      },
      "three_sixty_report_summary": {
        "number_by_filter_evaluations_received": "Number of %{filter} evaluations received",
        "number_of_evaluators_invited": "Number of evaluators invited",
        "number_of_evaluators_received": "Number of evaluations received",
        "number_of_evaluators_responded": "Number of evaluators responded",
        "subject": "Subject",
        "total_evaluations": "Total evaluations for this assessment"
      }
    },
    "show": {
      "export_pdf": "Export to PDF",
      "header": "Report"
    },
    "statuses": {
      "approved": "Approved",
      "available": "Available",
      "denied": "Denied",
      "incomplete": "Incomplete",
      "not_available": "Not available",
      "on_hold": "On hold"
    }
  },
  "subjects": {
    "statuses": {
      "completed": "Completed",
      "done": "Done",
      "not_completed": "Not Completed"
    }
  },
  "threesixty": {
    "add": "Add",
    "and": "And",
    "approve_all": "Approve All",
    "approve_evaluations": "Approve Evaluations",
    "approve_nominations": "Approve Nominations",
    "approve_reports": "Approve Reports",
    "approved": "Approved",
    "as_my": "as my",
    "back_to_tasks": "Back to tasks",
    "cancel": "Cancel",
    "decline": "Decline",
    "decline_invite": "Decline Invite",
    "denied": "Denied",
    "deny_all": "Deny All",
    "email_approve_request": "Email Approval Request",
    "evaluation": "Evaluation",
    "evaluations": "Evaluations",
    "help": {
      "evaluation": "<h2>Evaluations</h2> <p>There can be two different sections under Evaluations.</p> <h3>EVALUATIONS</h3> <p>Click on the person’s name to complete an evaluation of them.</p> <p>If you leave the page before you finish, you will be prompted to save.</p> <h3>APPROVE EVALUATIONS</h3> <p>This section only appears if you’re a Manager and have been given permission to approve your direct reports’ evaluations. An evaluation will not be added to the data in your direct report’s report until you approve.</p>\n<ol> <li><p>Navigate between your direct reports.</p></li> <li><p>Navigate between your direct reports’ evaluators.</p></li> <li><p>Change the status of the evaluation to <b>Approved</b>  or <b>Denied</b>.</p></li> </ol> <p>You can also download a PDF of the evaluation you’re reviewing.</p>",
      "main": "<h2>Help</h2> <p>need content for help modal</p>",
      "nomination": "<h2>Nominations</h2> <p>You either need to nominate people to evaluate you, nominate people to evaluate your direct reports, or approve your direct reports’ nominations.</p> <h3>SET UP NOMINATIONS</h3> <p>Sometimes, you will be asked to nominate coworkers you want to evaluate you.</p><ol> <li><p>To nominate an evaluator, type their name or email to find them. Then define their relationship to you. Click <b>Nominate Evaluator</b>  when finished.</p></li> <li><p>If your Manager is responsible for approving your nominations, remind them by clicking  <b>Email Approval Request</b> This option will not appear for everyone.</p></li> <li><p>Review the Approval and Evaluation status of your nominations.</p></li> <li><p>Remove a nomination by clicking the dropdown arrow and selecting <b>Remove</b>. This will not delete the data, but it will remove it from your report, and your evaluator won’t be able to retake this assessment.</p></li> </ol> <p>If you are a Manager, you may also be asked to nominate evaluators for your direct reports. In that case, the process will look the same.</p> <h3>APPROVE NOMINATIONS</h3> <p>If you are a Manager, you may be asked to approve the people your direct reports nominated to evaluate them. These evaluators will not be able to evaluate your direct report until you approve. Any email notifications set up will also not go out until the manager has approved a nomination.</p> <p>Approval technically takes place on the same screen where you’d set up your direct reports’ nominations, if you had that task.</p>​ <ol> <li><p>Click <b>Approve All</b>  to approve all nominations on the page.</p></li> <li><p>Click <b>Deny All</b>  to deny all nominations on the page.</p></li> <li><p>Click the dropdown next to a particular nomination to approve or deny just that nomination. <b>Waiting</b> means you haven’t made a decision yet.</p></li> </ol>",
      "report": "<h2>Report</h2> <p>There can be two different sections under Report.</p> <h3>VIEW REPORT</h3> <p>Here, you can view any reports you have access to. For most people, this is just their own.</p> <ol> <li><p>Change whose report you’re viewing.</p></li> <li><p>Determine if you are viewing the report as a subject or Manager.</p></li> <li><p>Click the arrow to download your report. If you click the dropdown menu, you can also select <b>Download All Reports</b>  to download all the reports you have access to. All downloads are in PDF format.</p></li> <li><p>Click the email icon to send a copy of the report to the email associated with your login.</p></li> </ol> <h3>APPROVE REPORTS</h3> <p>If you are a Manager, you may be asked to approve reports. Your direct report will not see their report until you approve it.</p> <p>On this page, you can switch between subject and Manager views, download, and email these reports just as your would your own, with a few differences.</p> <ol> <li><p>Navigate between direct reports.</p></li> <li><p><b>Deny</b>  the report release.</p></li> <li><p>Approve the report for release.</p></li> </ol>"
    },
    "language": "Language",
    "my_projects": "My Projects",
    "nominate": "Nominate",
    "nominate_evaluators": "Nominate Evaluators to",
    "nomination": "Nomination",
    "nominations": "Nominations",
    "or": "Or",
    "page_title": "Signify 360° Review - Apply Level",
    "remind_all": "Remind All",
    "reports": "Reports",
    "select_relationnship": "Select Relationship",
    "select_relationship": "Select Relationship",
    "setup_nominations": "Set up nominations",
    "total_progress": "Total progress",
    "user_name_input_placeholder": "type name or email...",
    "waiting": "Waiting"
  },
  "validations": {
    "character_range": "يجب أن تتكون إجابتك من  %{min} حرفاً كحد أدنى وألا تزيد عن %{max} حرفًا كحد أقصى.",
    "date": "(dd/mm/yyyy) يجب أن يتم إدخال تاريخ صحيح",
    "each_group_contains": "يجب أن تحتوي كل مجموعة على  %{min} عنصر كحد أدنى ولا تزيد عن %{max} كحد أقصى",
    "email": "البريد الإلكتروني غير صحيح",
    "issue": " الخطأ",
    "least": "الرجاء اختيار %{min} خيارات كحد أدنى.",
    "least_hotspot": "الرجاء اختيار %{min} خيارات كحد أدنى.",
    "max_length": " يجب ألا تتجاوز إجابتك %{max} حرفًا.",
    "min_length": "يجب أن تتكون إجابتك من  %{min} حرفًا كحد أدنى. ",
    "must_rank_between": " يرجى وضع قيمة من %{min} إلى %{max} لكل عنصر. لا يجب أن تتكرر القيم.",
    "must_select": "الرجاء اختيار من  %{min} إلى %{max} من الاختيارات",
    "number": "يجب أن تحتوي الإجابة على أرقام",
    "please_answer_question": "الرجاء الإجابة على هذا السؤال",
    "please_record_and_save_video_first": "Please record and save the video before you continue",
    "range": "الرجاء الإجابة عن  %{min} كحد أدنى و  %{max} كحد أقصى من الخيارات. ",
    "text": "يجب ألا تحتوي إجابتك على أرقام",
    "title": " عذرًا، لا يمكنك المتابعة حتى تقوم بتصحيح ما يلي: "
  }
});
I18n.translations["ms"] = I18n.extend((I18n.translations["ms"] || {}), {
  "reports": {
    "modules": {
      "common": {
        "almost_always": "Almost Always",
        "less_typical": "Less Typical",
        "moderate": "Moderate",
        "more_typical": "More Typical",
        "rare": "Rare"
      },
      "cpi_occupations": {
        "occupations": "Occupations",
        "your_potential_suitability": "Your Potential Suitability"
      },
      "gap_assessment": {
        "gap": "Gap",
        "item": "Item",
        "negative_gap": "Negative Gaps",
        "no_negative_gaps": "There are no Negative Gaps",
        "no_positive_gaps": "There are no Positive Gaps",
        "positive_gap": "Positive Gaps",
        "rank": "Rank",
        "scoring_category": "Scoring Category"
      },
      "highest_lowest": {
        "average": "Average",
        "bottom_5": "BOTTOM 5",
        "category": "Category",
        "email": "Email",
        "first_name": "First Name",
        "highest_scores": "Highest Scores",
        "item": "Item",
        "last_name": "Last Name",
        "lowest_scores": "Lowest scores",
        "mean_score": "Mean Score",
        "rank": "Rank",
        "result": "Result",
        "score": "Score",
        "scoring_category": "Scoring Category",
        "sub_competenties": "Sub-Competencies",
        "top_5": "TOP 5"
      },
      "potential_career_full": {
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "career_strengths_and_results": "Career Strengths and Your Results",
        "career_sub_tracks": "Career Sub-tracks",
        "detailed_career_guide": "Detailed Career Guide",
        "diploma_qualification": "Diploma Qualification",
        "education_level": "Education Level",
        "high_school_entry_roles": "High School Entry Roles",
        "key_career_tracks_within": "Below is a list of potential job roles for each of the career tracks. Remember this list is indicative only, and not exhaustive. Do note that roles in italics require higher levels of education and / or experience.",
        "potential_areas_of_study": "Potential Areas of Study",
        "potential_roles": "Potential Roles",
        "strength_high": "Signature Strength",
        "strength_low": "Developmental Strength",
        "strength_moderate": "Potential Strength",
        "work_environment": "Work Environment",
        "your_suitability": "Your Suitability"
      },
      "potential_career_short": {
        "career": "career",
        "for_this": "for this",
        "key": "key",
        "strengths": "strengths",
        "your_scores": "Your Scores"
      },
      "single_value": {
        "factor_name": "Scoring Category",
        "question_name": "Questions"
      },
      "single_value_cluster": {
        "competency": "Competency",
        "description": "Description",
        "developmental_rating": "Developmental Rating",
        "questions": "Questions"
      },
      "strength_clusters": {
        "index_sub_factors_considered": "Thriving Index sub-factors that have been considered to provide your final score for the %{workstyle} work environment",
        "possible_roles": "Possible Roles",
        "work_environments": "Expected Work Environments"
      },
      "three_sixty_default": {
        "factor": {
          "items": "Items",
          "max": "Max Value",
          "mean": "Mean",
          "min": "Min Value",
          "standardDeviation": "Standard Deviation",
          "sum": "Sum",
          "totalResponses": "Total Responses",
          "variance": "Variance",
          "weightedMean": "Weighted Mean"
        },
        "statistic": "Statistic",
        "value": "Value"
      },
      "three_sixty_report_summary": {
        "number_by_filter_evaluations_received": "Number of %{filter} evaluations received",
        "number_of_evaluators_invited": "Number of evaluators invited",
        "number_of_evaluators_received": "Number of evaluations received",
        "number_of_evaluators_responded": "Number of evaluators responded",
        "subject": "Subject",
        "total_evaluations": "Total evaluations for this assessment"
      }
    },
    "show": {
      "export_pdf": "Export to PDF",
      "header": "Report"
    },
    "statuses": {
      "approved": "Approved",
      "available": "Available",
      "denied": "Denied",
      "incomplete": "Incomplete",
      "not_available": "Not available",
      "on_hold": "On hold"
    }
  },
  "subjects": {
    "statuses": {
      "completed": "Completed",
      "done": "Done",
      "not_completed": "Not Completed"
    }
  },
  "threesixty": {
    "add": "Add",
    "and": "And",
    "approve_all": "Approve All",
    "approve_evaluations": "Approve Evaluations",
    "approve_nominations": "Approve Nominations",
    "approve_reports": "Approve Reports",
    "approved": "Approved",
    "as_my": "as my",
    "back_to_tasks": "Back to tasks",
    "cancel": "Cancel",
    "decline": "Decline",
    "decline_invite": "Decline Invite",
    "denied": "Denied",
    "deny_all": "Deny All",
    "email_approve_request": "Email Approval Request",
    "evaluation": "Evaluation",
    "evaluations": "Evaluations",
    "help": "Help",
    "language": "Language",
    "my_projects": "My Projects",
    "nominate": "Nominate",
    "nominate_evaluators": "Nominate Evaluators to",
    "nomination": "Nomination",
    "nominations": "Nominations",
    "or": "Or",
    "page_title": "Signify 360° Review - Apply Level",
    "remind_all": "Remind All",
    "reports": "Reports",
    "select_relationnship": "Select Relationship",
    "select_relationship": "Select Relationship",
    "setup_nominations": "Set up nominations",
    "total_progress": "Total progress",
    "user_name_input_placeholder": "type name or email...",
    "waiting": "Waiting"
  },
  "validations": {
    "character_range": "Your response must be at least %{min} and no more than %{max} characters.",
    "date": "Your response must be a valid date (dd/mm/yyyy)",
    "each_group_contains": "Each group needs to contain not less than %{min} and not more than %{max} items",
    "email": "Your response must be a valid email",
    "issue": "Issue",
    "least": "Please answer at least %{min} choice(s).",
    "least_hotspot": "Please answer at least %{min} choice(s).",
    "max_length": "Your response must be no more than %{max} characters.",
    "min_length": "Your response must be at least %{min} characters.",
    "must_rank_between": "Please assign a value from %{min} to %{max} for each item. Values may not be repeated.",
    "must_select": "Please select from %{min} to %{max} choices",
    "number": "Your response must be a number",
    "please_answer_question": "Please answer this question",
    "please_record_and_save_video_first": "Please record and save the video before you continue",
    "range": "Please answer at least %{min} and no more than %{max} choice(s).",
    "text": "Your response must not contain a numbers",
    "title": "Sorry, you cannot continue until you correct the following:"
  }
});
